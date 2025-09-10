import { IProject } from '../../entities/interfaces/project.interface';
import { IBaseSchema } from './base-schema.interface';
import { IQueryTransaction } from './query-transaction.interface';

export interface IQueryTransactionEvent extends IBaseSchema {
    project: IProject;
    transaction?: IQueryTransaction;
    queryId: string;
    rawQuery: string;
    parameters: Record<string, any>;
    executionTimeMs: number;
    stackTraces: string[];
    timestamp: Date;
    receivedAt: Date;
    contextType?: string;
    environment: string;
    applicationName?: string;
    version?: string;
    sourceApiKey: string;
    severity: string;
    executionPlan?: IQueryTransactionEventExecutionPlan | null;
}

export interface IQueryTransactionEventExecutionPlan {
    databaseProvider: string;
    planFormat: IQueryTransactionEventExecutionPlanFormat;
    content: string;
}

export interface IQueryTransactionEventExecutionPlanFormat {
    contentType: string;
    fileExtension: string;
    description: string;
}
