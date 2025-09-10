import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IProject } from '../entities/interfaces/project.interface';
import { BaseSchema } from './base.schema';
import {
    IQueryTransactionEvent,
    IQueryTransactionEventExecutionPlan,
} from './interfaces/query-transaction-event.interface';
import { IQueryTransaction } from './interfaces/query-transaction.interface';
import { QueryTransaction } from './query-transaction.schema';

@Schema({
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: 'query_transaction_events',
})
export class QueryTransactionEvent
    extends BaseSchema
    implements IQueryTransactionEvent
{
    @Prop({
        type: QueryTransaction,
        ref: QueryTransaction.name,
        required: false,
    })
    transaction?: IQueryTransaction;

    @Prop({ required: true })
    queryId: string;

    @Prop({ required: true })
    timestamp: Date;

    @Prop({
        type: Object,
    })
    project: IProject;

    @Prop({ required: true })
    rawQuery: string;

    @Prop({
        type: Object,
        required: true,
    })
    parameters: Record<string, any>;

    @Prop({ required: true })
    executionTimeMs: number;

    @Prop({ required: true })
    stackTraces: string[];

    @Prop({ required: true, default: () => new Date() })
    receivedAt: Date;

    @Prop({ required: false })
    contextType?: string;

    @Prop({ required: true })
    environment: string;

    @Prop({ required: false })
    applicationName?: string;

    @Prop({ required: false })
    version?: string;

    @Prop({ required: true })
    sourceApiKey: string;

    @Prop({ required: true })
    severity: string;

    @Prop({
        type: Object,
        required: false,
    })
    executionPlan?: IQueryTransactionEventExecutionPlan | null;
}

export type QueryTransactionEventDocument =
    HydratedDocument<IQueryTransactionEvent>;

export const QueryTransactionEventSchema = SchemaFactory.createForClass(
    QueryTransactionEvent,
);
