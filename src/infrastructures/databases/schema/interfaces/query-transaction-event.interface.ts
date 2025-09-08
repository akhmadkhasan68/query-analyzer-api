import { IBaseSchema } from './base-schema.interface';
import { IQueryTransaction } from './query-transaction.interface';

export interface IQueryTransactionEvent extends IBaseSchema {
    projectId: string;
    transaction: IQueryTransaction;
    rawQuery: string;
    parameters: Record<string, any>;
    executionTimeMs: number;
    stackTraces: string[];
    timestamp: Date;
    receivedAt: Date;
    contextType?: string;
    environment: string;
    applicationName: string;
    version?: string;
    sourceApiKey: string;
    severity: string;
    executionPlan?: IQueryTransactionEventExecutionPlan | null;
}

export interface IQueryTransactionEventExecutionPlan {
    databaseProvider: string;
    planFormat: {
        contentType: string;
        fileExtension: string;
        description: string;
    };
    content: string;
}
