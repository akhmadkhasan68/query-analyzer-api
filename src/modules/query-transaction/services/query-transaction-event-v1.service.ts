import {
    Injectable,
    Logger,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IProjectKey } from 'src/infrastructures/databases/entities/interfaces/project-key.interface';
import { IProject } from 'src/infrastructures/databases/entities/interfaces/project.interface';
import {
    IQueryTransactionEvent,
    IQueryTransactionEventExecutionPlanFormat,
} from 'src/infrastructures/databases/schema/interfaces/query-transaction-event.interface';
import { IQueryTransaction } from 'src/infrastructures/databases/schema/interfaces/query-transaction.interface';
import {
    QueueName,
    QueueQueryTransactionEventJob,
} from 'src/infrastructures/modules/queue/constants/queue-name.constant';
import { QueueQueryTransactionEventSendAiAnalysisEventDto } from 'src/infrastructures/modules/queue/dtos/queue-query-transaction-event-send-ai-analysis-event.dto';
import { QueueQueryTransactionEventDto } from 'src/infrastructures/modules/queue/dtos/queue-query-transaction-event.dto';
import { IQueueService } from 'src/infrastructures/modules/queue/interfaces/queue-service.interface';
import { QueueFactoryService } from 'src/infrastructures/modules/queue/services/queue-factory.service';
import { ProjectKeyV1Repository } from 'src/modules/project/repositories/project-key-v1.repository';
import { ProjectV1Repository } from 'src/modules/project/repositories/project-v1.repository';
import { SlackMessageV1Service } from 'src/modules/slack/services/slack-message-v1.service';
import { SlackMessageTemplateHelper } from 'src/modules/slack/shared/helpers/slack-message-template.helper';
import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { HashUtil } from 'src/shared/utils/hash.util';
import { QueryTransactionEventAiAnalyzeV1Request } from '../dtos/requests/query-transaction-event-ai-analyze.request';
import { QueryTransactionEventCaptureV1Request } from '../dtos/requests/query-transaction-event-capture-v1.request';
import { QueryTransactionEventPaginationV1Request } from '../dtos/requests/query-transaction-event-paginate-v1.request';
import { QueryTransactionEventV1Repository } from '../repositories/query-transaction-event-v1.repository';
import { QueryTransactionV1Repository } from '../repositories/query-transaction-v1.repository';
import { QueryTransactionSeverityEnum } from '../shared/enums/query-transaction-severity.enum';
import { QueryTransactionV1Service } from './query-transaction-v1.service';

@Injectable()
export class QueryTransactionEventV1Service {
    /**
     * Queue service for handling email sending.
     */
    private queueQueryTransactionEventService: IQueueService;
    private readonly logger = new Logger(QueryTransactionEventV1Service.name);

    constructor(
        private readonly queryTransactionRepository: QueryTransactionV1Repository,
        private readonly queryTransactionEventRepository: QueryTransactionEventV1Repository,
        private readonly projectRepository: ProjectV1Repository,
        private readonly projectKeyRepository: ProjectKeyV1Repository,
        private readonly queueFactoryService: QueueFactoryService,
        private readonly queryTransactionV1Service: QueryTransactionV1Service,
        private readonly slackMessageService: SlackMessageV1Service,
    ) {
        this.queueQueryTransactionEventService =
            this.queueFactoryService.createQueueService(
                QueueName.QueryTransactionEvent,
            );
    }

    async paginate(
        paginationDto: QueryTransactionEventPaginationV1Request,
    ): Promise<IPaginateData<IQueryTransactionEvent>> {
        return await this.queryTransactionEventRepository.paginate(
            paginationDto,
        );
    }

    async captureEvent(
        projectKey: IProjectKey,
        request: QueryTransactionEventCaptureV1Request,
    ): Promise<void> {
        const { projectId } = projectKey;

        if (!projectId) {
            throw new UnprocessableEntityException(
                'Project not found for the provided project key.',
            );
        }

        const [projectDetail, projectKeyDetail] = await Promise.all([
            this.projectRepository.findOneOrFailByIdWithRelations(projectId, [
                'platform',
                'projectGitlab',
                'projectSlackChannels',
            ]),
            this.projectKeyRepository.findOneByIdOrFail(projectKey.id),
        ]);

        // Send to Queue for processing
        await this.queueQueryTransactionEventService.sendToQueue<QueueQueryTransactionEventDto>(
            {
                project: projectDetail,
                projectKey: projectKeyDetail,
                ...request,
            },
            QueueQueryTransactionEventJob.SendQueryTransactionEvent,
        );
    }

    public async queueProcessCaptureEvent(
        project: IProject,
        projectKey: IProjectKey,
        request: QueryTransactionEventCaptureV1Request,
    ): Promise<void> {
        this.logger.log(
            `Processing capture event for project: ${project.id} \n Request: ${JSON.stringify(request)}`,
        );

        try {
            // Create Data Query Transaction Event
            const severity = this.determineSeverity(request.executionTimeMs);
            const eventData: IQueryTransactionEvent = {
                id: randomUUID(),
                project: project,
                queryId: request.queryId,
                rawQuery: request.rawQuery,
                parameters: request.parameters || {},
                executionTimeMs: request.executionTimeMs,
                stackTraces: request.stackTrace || [],
                timestamp: request.timestamp,
                receivedAt: new Date(),
                contextType: request.contextType,
                environment: request.environment,
                applicationName: request.applicationName,
                version: request.version,
                sourceApiKey: projectKey.maskedKey,
                severity: severity,
            };

            if (request.executionPlan) {
                eventData.executionPlan = {
                    databaseProvider: request.executionPlan.databaseProvider,
                    planFormat: request.executionPlan
                        .planFormat as IQueryTransactionEventExecutionPlanFormat,
                    content: request.executionPlan.content as string,
                };
            }

            // Query Transaction Event Signture
            const querySignature = this.generateQueryTransactionEventSignature(
                project,
                projectKey,
                request,
            );

            // Check if Query Transaction already exists by Signature
            const isExistsBySignature =
                await this.queryTransactionRepository.isExistsBySignature(
                    querySignature,
                );

            let queryTransaction: IQueryTransaction;
            if (!isExistsBySignature) {
                // Create new Query Transaction
                const queryTransactionData = {
                    projectId: project.id,
                    rawQuery: request.rawQuery,
                    parameters: request.parameters || {},
                    signature: querySignature,
                    totalExecutionTime: request.executionTimeMs,
                    averageExecutionTime: request.executionTimeMs,
                    maxExecutionTime: request.executionTimeMs,
                    minExecutionTime: request.executionTimeMs,
                    environment: request.environment,
                };

                queryTransaction =
                    await this.queryTransactionV1Service.createTransaction(
                        queryTransactionData,
                    );
            } else {
                // Update existing Query Transaction
                queryTransaction =
                    await this.queryTransactionV1Service.updateTransactionBySignature(
                        querySignature,
                        {
                            totalExecutionTime: request.executionTimeMs,
                            maxExecutionTime: request.executionTimeMs,
                            minExecutionTime: request.executionTimeMs,
                        },
                    );
            }

            // Link Event to Transaction
            eventData.transaction = queryTransaction;

            // Save Query Transaction Event
            await this.queryTransactionEventRepository.create(eventData);

            // Send Slack Notification
            if (
                // severity === QueryTransactionSeverityEnum.MEDIUM &&
                project.projectSlackChannels &&
                project.projectSlackChannels.length > 0
            ) {
                try {
                    // Send Slack notification for query transaction event alert
                    this.slackMessageService.sendMessageToMultipleChannels(
                        project.projectSlackChannels.map(
                            (channel) => channel.slackChannelId,
                        ),
                        SlackMessageTemplateHelper.queryTransactionEventAlert(
                            project,
                            eventData,
                        ),
                    );
                } catch (error) {
                    // Log error but do not fail the main process
                    this.logger.error(
                        `Failed to send Slack notification: ${error.message}`,
                    );
                }
            }
        } catch (error) {
            this.logger.error(
                `Error occurred while processing event: ${error.message}`,
            );

            throw error;
        }
    }

    async AIAnalyze(
        request: QueryTransactionEventAiAnalyzeV1Request,
    ): Promise<void> {
        const events = await this.queryTransactionEventRepository.findByIds(
            request.ids,
        );

        if (events.length !== request.ids.length) {
            const notFoundIds = request.ids.filter(
                (id) => !events.find((event) => event.id === id),
            );

            throw new NotFoundException(
                ERROR_MESSAGE_CONSTANT.DataIdsNotFound(notFoundIds),
            );
        }

        for (const event of events) {
            await this.queueQueryTransactionEventService.sendToQueue<QueueQueryTransactionEventSendAiAnalysisEventDto>(
                event,
                QueueQueryTransactionEventJob.SendAIAnalysisEvent,
            );
        }
    }

    async queueProcessAIAnalyze(
        _event: QueueQueryTransactionEventSendAiAnalysisEventDto,
    ): Promise<void> {
        try {
            // TODO: implement AI analyze process result
        } catch (error) {
            throw error;
        }
    }

    private generateQueryTransactionEventSignature(
        project: IProject,
        projectKey: IProjectKey,
        request: QueryTransactionEventCaptureV1Request,
    ): string {
        // Create a unique signature for the query transaction
        const signatureComponents = [
            project.id,
            projectKey.id,
            request.environment,
        ];

        if (request.stackTrace && request.stackTrace.length > 0) {
            const stackTraceString = request.stackTrace
                .map((trace) => trace.trim())
                .join('-');

            signatureComponents.push(stackTraceString);
        }

        if (
            typeof request.parameters !== 'undefined' &&
            request.parameters &&
            Object.keys(request.parameters).length > 0
        ) {
            const paramsString = Object.keys(request.parameters)
                .sort()
                .map((key) => {
                    const value = request.parameters?.[key];

                    if (value) {
                        return `${key}:${JSON.stringify(value)}`;
                    }
                })
                .filter((item) => item !== undefined)
                .join('-');

            signatureComponents.push(paramsString);
        }

        return HashUtil.generateSha256Hex(signatureComponents.join('|'));
    }

    // TODO: determine severity based on project settings and thresholds
    private determineSeverity(
        executionTimeMs: number,
    ): QueryTransactionSeverityEnum {
        const criticalThresholdInMs = 5000; // 5 seconds
        const highThresholdInMs = 2000; // 2 seconds
        const mediumThresholdInMs = 1000; // 1 second

        if (executionTimeMs > criticalThresholdInMs) {
            return QueryTransactionSeverityEnum.CRITICAL;
        } else if (executionTimeMs > highThresholdInMs) {
            return QueryTransactionSeverityEnum.HIGH;
        } else if (executionTimeMs > mediumThresholdInMs) {
            return QueryTransactionSeverityEnum.MEDIUM;
        } else {
            return QueryTransactionSeverityEnum.LOW;
        }
    }
}
