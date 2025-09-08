import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IQueryTransaction } from 'src/infrastructures/databases/schema/interfaces/query-transaction.interface';
import { QueryTransaction } from 'src/infrastructures/databases/schema/query-transaction.schema';
import { DataNotFoundException } from 'src/shared/exceptions/data-not-found.exception';

@Injectable()
export class QueryTransactionV1Repository {
    constructor(
        @InjectModel(QueryTransaction.name)
        private readonly queryTransactionModel: Model<IQueryTransaction>,
    ) {}

    async create(data: Partial<IQueryTransaction>): Promise<IQueryTransaction> {
        const createdQueryTransaction = new this.queryTransactionModel(data);
        return await createdQueryTransaction.save();
    }

    async findById(id: string): Promise<IQueryTransaction | null> {
        return await this.queryTransactionModel.findById(id).exec();
    }

    async findByIdOrFail(id: string): Promise<IQueryTransaction> {
        const result = await this.queryTransactionModel.findById(id).exec();

        if (!result) {
            throw new DataNotFoundException();
        }

        return result;
    }

    async update(
        id: string,
        data: Partial<IQueryTransaction>,
    ): Promise<IQueryTransaction | null> {
        return await this.queryTransactionModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();
    }

    async delete(id: string): Promise<IQueryTransaction | null> {
        return await this.queryTransactionModel.findByIdAndDelete(id).exec();
    }
}
