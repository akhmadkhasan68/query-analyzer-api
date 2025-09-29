import { QueryTransactionSeverityEnum } from '../../../../modules/query-transaction/shared/enums/query-transaction-severity.enum';
import { QueryTransactionStatusEnum } from '../../../../modules/query-transaction/shared/enums/query-transaction-status.enum';
import { IProject } from '../../entities/interfaces/project.interface';
import { IBaseSchema } from './base-schema.interface';

export interface IQueryTransaction extends IBaseSchema {
    project: IProject;
    rawQuery: string;
    parameters: Record<string, any>;
    signature: string;
    description?: string;
    status: QueryTransactionStatusEnum;
    firstOccurrence: Date;
    occurrenceCount: number;
    totalExecutionTime: number;
    averageExecutionTime: number;
    maxExecutionTime: number;
    minExecutionTime: number;
    environment: string;
    severity: QueryTransactionSeverityEnum;
    assignedTo?: string;
    assignedAt?: Date;
    assignedBy?: string;
    tags?: string[];
    notes?: string[];
}
