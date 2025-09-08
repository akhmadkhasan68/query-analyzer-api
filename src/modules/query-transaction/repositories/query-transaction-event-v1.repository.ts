import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IQueryTransactionEvent } from 'src/infrastructures/databases/schema/interfaces/query-transaction-event.interface';
import { QueryTransactionEvent } from 'src/infrastructures/databases/schema/query-transaction-event.schema';
import { DataNotFoundException } from 'src/shared/exceptions/data-not-found.exception';

@Injectable()
export class QueryTransactionEventV1Repository {
    constructor(
        @InjectModel(QueryTransactionEvent.name)
        private readonly queryTransactionEventModel: Model<IQueryTransactionEvent>,
    ) {}

    async create(
        data: IQueryTransactionEvent,
    ): Promise<IQueryTransactionEvent> {
        const createdQueryTransactionEvent =
            new this.queryTransactionEventModel(data);
        return createdQueryTransactionEvent.save();
    }

    async findById(id: string): Promise<IQueryTransactionEvent | null> {
        return this.queryTransactionEventModel.findById(id).exec();
    }

    async findByIdOrFail(id: string): Promise<IQueryTransactionEvent> {
        const result = await this.queryTransactionEventModel
            .findById(id)
            .exec();

        if (!result) {
            throw new DataNotFoundException();
        }

        return result;
    }

    async update(
        id: string,
        data: Partial<IQueryTransactionEvent>,
    ): Promise<IQueryTransactionEvent | null> {
        return this.queryTransactionEventModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();
    }

    async delete(id: string): Promise<IQueryTransactionEvent | null> {
        return this.queryTransactionEventModel.findByIdAndDelete(id).exec();
    }
}
