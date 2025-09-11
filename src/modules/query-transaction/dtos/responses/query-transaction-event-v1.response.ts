import { IQueryTransactionEvent } from 'src/infrastructures/databases/schema/interfaces/query-transaction-event.interface';
import { ProjectV1Response } from 'src/modules/project/dtos/responses/project-v1.response';

export class QueryTransactionEventV1Response {
    id: string;
    project: ProjectV1Response;
    queryId: string;
    rawQuery: string;
    executionTimeMs: number;
    timestamp: Date;
    receivedAt: Date;
    environment: string;
    severity: string;
    createdAt?: Date;
    updatedAt?: Date;

    static FromEntity(
        entity: Partial<IQueryTransactionEvent>,
    ): QueryTransactionEventV1Response {
        return Object.assign(new QueryTransactionEventV1Response(), {
            id: entity.id,
            project: entity.project
                ? ProjectV1Response.FromEntity(entity.project)
                : undefined,
            queryId: entity.queryId,
            rawQuery: entity.rawQuery,
            executionTimeMs: entity.executionTimeMs,
            timestamp: entity.timestamp,
            receivedAt: entity.receivedAt,
            environment: entity.environment,
            severity: entity.severity,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }

    static FromEntities(
        entities: Partial<IQueryTransactionEvent>[],
    ): QueryTransactionEventV1Response[] {
        return entities.map((entity) =>
            QueryTransactionEventV1Response.FromEntity(entity),
        );
    }
}
