import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IQueryTransactionEventAnalyzeReport } from 'src/infrastructures/databases/schema/interfaces/query-transaction-event-analyze-report.interface';
import { QueryTransactionEventAnalyzeReport } from 'src/infrastructures/databases/schema/query-transaction-event-analyze-report.schema';
import { DataNotFoundException } from 'src/shared/exceptions/data-not-found.exception';

@Injectable()
export class QueryTransactionEventAnalyzeReportV1Repository {
    constructor(
        @InjectModel(QueryTransactionEventAnalyzeReport.name)
        private readonly queryTransactionEventAnalyzeReportModel: Model<IQueryTransactionEventAnalyzeReport>,
    ) {}

    async create(
        data: IQueryTransactionEventAnalyzeReport,
    ): Promise<IQueryTransactionEventAnalyzeReport> {
        const createdQueryTransactionEvent =
            new this.queryTransactionEventAnalyzeReportModel(data);
        return createdQueryTransactionEvent.save();
    }

    async findByIds(
        ids: string[],
    ): Promise<IQueryTransactionEventAnalyzeReport[]> {
        return (
            this.queryTransactionEventAnalyzeReportModel

                // eslint-disable-next-line @typescript-eslint/naming-convention
                .find({ _id: { $in: ids } })
                .exec()
        );
    }

    async findByQueryTransactionEventIds(
        queryTransactionEventIds: string[],
    ): Promise<IQueryTransactionEventAnalyzeReport[]> {
        return this.queryTransactionEventAnalyzeReportModel
            .find({
                queryTransactionEventId: { $in: queryTransactionEventIds },
            })
            .exec();
    }

    async findOneById(
        id: string,
    ): Promise<IQueryTransactionEventAnalyzeReport | null> {
        return this.queryTransactionEventAnalyzeReportModel.findById(id).exec();
    }

    async findOneByIdOrFail(
        id: string,
    ): Promise<IQueryTransactionEventAnalyzeReport> {
        const result = await this.queryTransactionEventAnalyzeReportModel
            .findById(id)
            .exec();

        if (!result) {
            throw new DataNotFoundException();
        }

        return result;
    }

    async findOneByQueryTransactionEventId(
        queryTransactionEventId: string,
    ): Promise<IQueryTransactionEventAnalyzeReport | null> {
        return this.queryTransactionEventAnalyzeReportModel
            .findOne({ queryTransactionEventId: queryTransactionEventId })
            .exec();
    }

    async findOneByQueryTransactionEventIdOrFail(
        queryTransactionEventId: string,
    ): Promise<IQueryTransactionEventAnalyzeReport> {
        const result = await this.queryTransactionEventAnalyzeReportModel
            .findOne({ queryTransactionEventId: queryTransactionEventId })
            .exec();

        if (!result) {
            throw new DataNotFoundException();
        }

        return result;
    }

    async update(
        id: string,
        data: Partial<IQueryTransactionEventAnalyzeReport>,
    ): Promise<IQueryTransactionEventAnalyzeReport | null> {
        return this.queryTransactionEventAnalyzeReportModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();
    }

    async delete(
        id: string,
    ): Promise<IQueryTransactionEventAnalyzeReport | null> {
        return this.queryTransactionEventAnalyzeReportModel
            .findByIdAndDelete(id)
            .exec();
    }
}
