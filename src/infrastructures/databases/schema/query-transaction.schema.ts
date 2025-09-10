import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { QueryTransactionSeverityEnum } from '../../../modules/query-transaction/shared/enums/query-transaction-severity.enum';
import { QueryTransactionStatusEnum } from '../../../modules/query-transaction/shared/enums/query-transaction-status.enum';
import { IProject } from '../entities/interfaces/project.interface';
import { BaseSchema } from './base.schema';
import { IQueryTransaction } from './interfaces/query-transaction.interface';

@Schema({
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: 'query_transactions',
})
export class QueryTransaction extends BaseSchema implements IQueryTransaction {
    @Prop({
        type: Object,
        required: true,
    })
    project: IProject;

    @Prop({ required: true })
    signature: string;

    @Prop({ required: false })
    description?: string;

    @Prop({
        required: true,
        enum: QueryTransactionStatusEnum,
        default: QueryTransactionStatusEnum.OPEN,
    })
    status: QueryTransactionStatusEnum;

    @Prop({ required: true, default: () => new Date() })
    firstOccurrence: Date;

    @Prop({ required: true, default: 1 })
    occurrenceCount: number;

    @Prop({ required: true, default: 0 })
    totalExecutionTime: number;

    @Prop({ required: true, default: 0 })
    averageExecutionTime: number;

    @Prop({ required: true, default: 0 })
    maxExecutionTime: number;

    @Prop({ required: true, default: 0 })
    minExecutionTime: number;

    @Prop({ required: true })
    environment: string;

    @Prop({
        required: true,
        enum: QueryTransactionSeverityEnum,
        default: QueryTransactionSeverityEnum.LOW,
    })
    severity: QueryTransactionSeverityEnum;

    @Prop({ required: false })
    assignedTo?: string;

    @Prop({ required: false })
    assignedAt?: Date;

    @Prop({ required: false })
    assignedBy?: string;

    @Prop({ required: false })
    tags?: string[];

    @Prop({ required: false })
    notes?: string[];
}

export type QueryTransactionDocument = HydratedDocument<IQueryTransaction>;

export const QueryTransactionSchema =
    SchemaFactory.createForClass(QueryTransaction);
