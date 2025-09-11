import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IProjectKey } from 'src/infrastructures/databases/entities/interfaces/project-key.interface';
import { IProject } from 'src/infrastructures/databases/entities/interfaces/project.interface';
import {
    IQueryTransactionEvent,
    IQueryTransactionEventExecutionPlanFormat,
} from 'src/infrastructures/databases/schema/interfaces/query-transaction-event.interface';
import { QUEUE_NAME } from 'src/infrastructures/modules/queue/constants/queue-name.constant';
import { IQueueService } from 'src/infrastructures/modules/queue/interfaces/queue-service.interface';
import { QueueFactoryService } from 'src/infrastructures/modules/queue/services/queue-factory.service';
import { ProjectKeyV1Repository } from 'src/modules/project/repositories/project-key-v1.repository';
import { ProjectV1Repository } from 'src/modules/project/repositories/project-v1.repository';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { QueryTransactionEventCaptureV1Request } from '../dtos/requests/query-transaction-event-capture-v1.request';
import { QueryTransactionEventPaginationV1Request } from '../dtos/requests/query-transaction-event-paginate-v1.request';
import { QueryTransactionEventV1Repository } from '../repositories/query-transaction-event-v1.repository';
import { QueryTransactionSeverityEnum } from '../shared/enums/query-transaction-severity.enum';

@Injectable()
export class QueryTransactionEventV1Service {
    /**
     * Queue service for handling email sending.
     */
    private queueQueryTransactionEventService: IQueueService;

    constructor(
        private readonly queryTransactionEventRepository: QueryTransactionEventV1Repository,
        private readonly projectRepository: ProjectV1Repository,
        private readonly projectKeyRepository: ProjectKeyV1Repository,
        private readonly queueFactoryService: QueueFactoryService,
    ) {
        this.queueQueryTransactionEventService =
            this.queueFactoryService.createQueueService(
                QUEUE_NAME.QueryTransactionEvent,
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
            this.projectRepository.findOneByIdWithRelationsOrFail(projectId, [
                'platform',
            ]),
            this.projectKeyRepository.findOneByIdOrFail(projectKey.id),
        ]);

        // Send to Queue for processing
        await this.queueQueryTransactionEventService.sendToQueue({
            project: projectDetail,
            projectKey: projectKeyDetail,
            ...request,
        });
    }

    public async queueProcessCaptureEvent(
        project: IProject,
        projectKey: IProjectKey,
        request: QueryTransactionEventCaptureV1Request,
    ): Promise<void> {
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

            await this.queryTransactionEventRepository.create(eventData);
        } catch (error) {
            throw error;
        }
    }

    private determineSeverity(
        executionTimeMs: number,
    ): QueryTransactionSeverityEnum {
        const criticalThreshold = 5000; // 5 seconds
        const highThreshold = 2000; // 2 seconds
        const mediumThreshold = 1000; // 1 second

        if (executionTimeMs > criticalThreshold) {
            return QueryTransactionSeverityEnum.CRITICAL;
        } else if (executionTimeMs > highThreshold) {
            return QueryTransactionSeverityEnum.HIGH;
        } else if (executionTimeMs > mediumThreshold) {
            return QueryTransactionSeverityEnum.MEDIUM;
        } else {
            return QueryTransactionSeverityEnum.LOW;
        }
    }
}
