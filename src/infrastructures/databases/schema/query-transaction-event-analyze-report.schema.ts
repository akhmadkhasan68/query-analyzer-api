import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IStorageFile } from '../entities/interfaces/storage-file.interface';
import { BaseSchema } from './base.schema';
import { IQueryTransactionEventAnalyzeReport } from './interfaces/query-transaction-event-analyze-report.interface';
import { IQueryTransactionEvent } from './interfaces/query-transaction-event.interface';

@Schema({
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: 'query_transaction_event_analyze_reports',
})
export class QueryTransactionEventAnalyzeReport
    extends BaseSchema
    implements IQueryTransactionEventAnalyzeReport
{
    @Prop({ required: true })
    queryTransactionEventId: string;

    @Prop({ type: Object, required: true })
    storageFile: IStorageFile;
}

export type QueryTransactionEventDocument =
    HydratedDocument<IQueryTransactionEvent>;

export const QueryTransactionEventAnalyzeReportSchema =
    SchemaFactory.createForClass(QueryTransactionEventAnalyzeReport);
