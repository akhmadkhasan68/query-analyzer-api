import {
    forwardRef,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IProjectKey } from 'src/infrastructures/databases/entities/interfaces/project-key.interface';
import { IProject } from 'src/infrastructures/databases/entities/interfaces/project.interface';
import { IQueryTransactionEventAnalyzeReport } from 'src/infrastructures/databases/schema/interfaces/query-transaction-event-analyze-report.interface';
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
import { N8nWebhookV1Service } from 'src/modules/n8n/services/n8n-webhook-v1.service';
import { N8nWebhookIdEnum } from 'src/modules/n8n/shared/enums/n8n-webhook-id.enum';
import { ProjectKeyV1Repository } from 'src/modules/project/repositories/project-key-v1.repository';
import { ProjectSlackChannelV1Repository } from 'src/modules/project/repositories/project-slack-channel-v1.repository';
import { ProjectV1Repository } from 'src/modules/project/repositories/project-v1.repository';
import { SlackMessageV1Service } from 'src/modules/slack/services/slack-message-v1.service';
import { SlackMessageTemplateHelper } from 'src/modules/slack/shared/helpers/slack-message-template.helper';
import { StorageFileV1Repository } from 'src/modules/storage-file/repositories/storage-file-v1.repository';
import { StorageFileV1Service } from 'src/modules/storage-file/services/storage-file-v1.service';
import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { HashUtil } from 'src/shared/utils/hash.util';
import { QueryTransactionEventAiAnalyzeV1Request } from '../dtos/requests/query-transaction-event-ai-analyze.request';
import { QueryTransactionEventCaptureV1Request } from '../dtos/requests/query-transaction-event-capture-v1.request';
import { QueryTransactionEventPaginationV1Request } from '../dtos/requests/query-transaction-event-paginate-v1.request';
import { QueryTransactionEventAnalyzeReportV1Repository } from '../repositories/query-transaction-event-analyze-report-v1.repository';
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
        private readonly queryTransactionEventAnalyzeReportV1Repository: QueryTransactionEventAnalyzeReportV1Repository,
        private readonly projectRepository: ProjectV1Repository,
        private readonly projectKeyRepository: ProjectKeyV1Repository,
        private readonly projectSlackChannelV1Repository: ProjectSlackChannelV1Repository,
        private readonly queueFactoryService: QueueFactoryService,
        private readonly queryTransactionV1Service: QueryTransactionV1Service,
        private readonly slackMessageService: SlackMessageV1Service,
        @Inject(forwardRef(() => N8nWebhookV1Service))
        private readonly n8nWebhookService: N8nWebhookV1Service,
        private readonly storageFileV1Repository: StorageFileV1Repository,
        private readonly storageFileService: StorageFileV1Service,
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

    async findOneByQueryId(queryId: string): Promise<IQueryTransactionEvent> {
        const event =
            await this.queryTransactionEventRepository.findOneByQueryIdOrFail(
                queryId,
            );

        return event;
    }

    async notifyEvent(queryIds: string[]): Promise<void> {
        const events =
            await this.queryTransactionEventRepository.findByQueryIds(queryIds);

        if (events.length !== queryIds.length) {
            const notFoundIds = queryIds.filter(
                (id) => !events.find((event) => event.queryId === id),
            );

            this.logger.warn(
                `Some query IDs not found: ${notFoundIds.join(', ')}`,
            );

            throw new NotFoundException(
                ERROR_MESSAGE_CONSTANT.DataIdsNotFound(notFoundIds),
            );
        }

        const projectIds = events.map((event) => event.project.id);
        const uniqueProjectIds = Array.from(new Set(projectIds));

        const projectSlackChannels =
            await this.projectSlackChannelV1Repository.findByProjectIds(
                uniqueProjectIds,
            );

        for (const event of events) {
            try {
                // Send Slack notification for query transaction event alert
                const projectChannels = projectSlackChannels.filter(
                    (channel) => channel.projectId === event.project.id,
                );

                if (projectChannels && projectChannels.length > 0) {
                    await this.slackMessageService.sendMessageToMultipleChannels(
                        projectChannels.map(
                            (channel) => channel.slackChannelId,
                        ),
                        SlackMessageTemplateHelper.queryTransactionEventAlert(
                            event.project,
                            event,
                        ),
                    );
                }
            } catch (error) {
                // Log error but do not fail the main process
                this.logger.error(
                    `Failed to send Slack notification for event ID ${event.id}: ${error.message}`,
                );
            }
        }
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

        // check if this event is already being analyzed
        const eventAnalyzeReport =
            await this.queryTransactionEventAnalyzeReportV1Repository.findByQueryTransactionEventIds(
                request.ids,
            );
        const alreadyAnalyzedEventIds = eventAnalyzeReport.map(
            (report) => report.queryTransactionEventId,
        );

        if (eventAnalyzeReport.length > 0) {
            const sendMessagePromises = eventAnalyzeReport.map(
                async (report) => {
                    this.sendAIAnalyzeReportToRequester(
                        report.queryTransactionEventId,
                        report,
                        request.slackUserId,
                        request.slackChannelId,
                        request.slackMessageTs,
                    );
                },
            );

            await Promise.all(sendMessagePromises);
        }

        const eventsToAnalyze = events.filter(
            (event) => !alreadyAnalyzedEventIds.includes(event.id),
        );
        if (eventsToAnalyze.length > 0) {
            const sendToQueuePromises = eventsToAnalyze.map((event) =>
                this.queueQueryTransactionEventService.sendToQueue<QueueQueryTransactionEventSendAiAnalysisEventDto>(
                    {
                        id: event.id,
                        slackChannelId: request.slackChannelId,
                        slackUserId: request.slackUserId,
                        slackMessageTs: request.slackMessageTs,
                    },
                    QueueQueryTransactionEventJob.SendAIAnalysisEvent,
                ),
            );

            await Promise.all(sendToQueuePromises);

            this.logger.log(
                `Queued ${eventsToAnalyze.length} events for AI analysis.`,
            );
        }
    }

    async queueProcessAIAnalyze(
        data: QueueQueryTransactionEventSendAiAnalysisEventDto,
    ): Promise<void> {
        const { slackChannelId, slackUserId, slackMessageTs, id } = data;

        try {
            await this.n8nWebhookService.triggerWebhook(
                N8nWebhookIdEnum.AiAnalyzeQueryTransactionEvent,
                {
                    id: id,
                    slackUserId: slackUserId,
                    slackChannelId: slackChannelId,
                    slackMessageTs: slackMessageTs,
                },
            );
        } catch (error) {
            this.logger.error(
                `Error occurred while triggering N8N webhook for AI analysis: ${error.message}`,
            );

            throw error;
        }
    }

    async saveAIAnalyzeReport(
        queryTransactionEventId: string,
        fileStorageId: string,
    ): Promise<IQueryTransactionEventAnalyzeReport> {
        const existingReport =
            await this.queryTransactionEventAnalyzeReportV1Repository.findOneByQueryTransactionEventId(
                queryTransactionEventId,
            );

        const storageFile =
            await this.storageFileV1Repository.findOneByIdOrFail(fileStorageId);

        if (!existingReport) {
            // Create new report
            const newReport: IQueryTransactionEventAnalyzeReport = {
                id: randomUUID(),
                queryTransactionEventId: queryTransactionEventId,
                storageFile: storageFile,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            return await this.queryTransactionEventAnalyzeReportV1Repository.create(
                newReport,
            );
        }

        return existingReport;
    }

    async sendAIAnalyzeReportToRequester(
        queryTransactionEventId: string,
        queryTransactionEventAnalyzeReport: IQueryTransactionEventAnalyzeReport,
        slackUserId: string,
        slackChannelId: string,
        slackMessageTs?: string,
    ): Promise<void> {
        const event =
            await this.queryTransactionEventRepository.findOneByIdOrFail(
                queryTransactionEventId,
            );

        // File Url
        const fileUrl = await this.storageFileService.getFileUrl(
            queryTransactionEventAnalyzeReport.storageFile.id,
        );

        if (
            !event.project.projectSlackChannels ||
            event.project.projectSlackChannels.length === 0
        ) {
            this.logger.warn(
                `No Slack channels configured for project ${event.project.name} (${event.project.id})`,
            );
            return;
        }

        // If specific slack channel is provided, use it; otherwise, use all project channels
        const targetChannels = slackChannelId
            ? [slackChannelId]
            : event.project.projectSlackChannels.map(
                  (channel) => channel.slackChannelId,
              );

        for (const channelId of targetChannels) {
            try {
                if (slackMessageTs) {
                    // Reply in thread if slackMessageTs is provided
                    await this.slackMessageService.sendMessageToChannelInThread(
                        channelId,
                        slackMessageTs,
                        SlackMessageTemplateHelper.queryTransactionEventAiAnalyzeReport(
                            slackUserId,
                            fileUrl,
                        ),
                    );
                } else {
                    // Send as new message if slackMessageTs is not provided
                    await this.slackMessageService.sendMessageToChannel(
                        channelId,
                        SlackMessageTemplateHelper.queryTransactionEventAiAnalyzeReport(
                            slackUserId,
                            fileUrl,
                        ),
                    );
                }
            } catch (error) {
                // Log error but do not fail the main process
                this.logger.error(
                    `Failed to send AI analyze report to Slack channel ${channelId}: ${error.message}`,
                );
            }
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
