import { IQueryTransaction } from 'src/infrastructures/databases/schema/interfaces/query-transaction.interface';

export class QueryTransactionV1Response {
    id: string;

    signature: string;
    description?: string;
    status: string;
    firstOccurrence: Date;
    occurrenceCount: number;
    totalExecutionTime: number;
    averageExecutionTime: number;
    maxExecutionTime: number;
    minExecutionTime: number;
    environment: string;
    severity: string;
    assignedTo?: string;
    assignedAt?: Date;
    assignedBy?: string;
    tags?: string[];
    notes?: string[];

    static FromEntity(entity: IQueryTransaction): QueryTransactionV1Response {
        return {
            id: entity.id,
            signature: entity.signature,
            description: entity.description,
            status: entity.status,
            firstOccurrence: entity.firstOccurrence,
            occurrenceCount: entity.occurrenceCount,
            totalExecutionTime: entity.totalExecutionTime,
            averageExecutionTime: entity.averageExecutionTime,
            maxExecutionTime: entity.maxExecutionTime,
            minExecutionTime: entity.minExecutionTime,
            environment: entity.environment,
            severity: entity.severity,
            assignedTo: entity.assignedTo,
            assignedAt: entity.assignedAt,
            assignedBy: entity.assignedBy,
            tags: entity.tags,
            notes: entity.notes,
        };
    }

    static MapEntities(
        entities: IQueryTransaction[],
    ): QueryTransactionV1Response[] {
        return entities.map((entity) => this.FromEntity(entity));
    }
}
