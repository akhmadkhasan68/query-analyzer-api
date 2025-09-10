import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IProjectKey } from 'src/infrastructures/databases/entities/interfaces/project-key.interface';
import {
    IQueryTransactionEvent,
    IQueryTransactionEventExecutionPlanFormat,
} from 'src/infrastructures/databases/schema/interfaces/query-transaction-event.interface';
import { QueryTransactionEventCaptureV1Request } from '../dtos/requests/query-transaction-event-capture-v1.request';
import { QueryTransactionEventV1Repository } from '../repositories/query-transaction-event-v1.repository';
import { QueryTransactionSeverityEnum } from '../shared/enums/query-transaction-severity.enum';

@Injectable()
export class QueryTransactionEventV1Service {
    constructor(
        private readonly queryTransactionEventRepository: QueryTransactionEventV1Repository,
    ) {}

    async captureEvent(
        projectKey: IProjectKey,
        request: QueryTransactionEventCaptureV1Request,
    ): Promise<void> {
        const { project } = projectKey;

        if (!project) {
            throw new UnprocessableEntityException(
                'Project not found for the provided project key.',
            );
        }

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
