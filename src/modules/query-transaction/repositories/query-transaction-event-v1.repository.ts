import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IQueryTransactionEvent } from 'src/infrastructures/databases/schema/interfaces/query-transaction-event.interface';
import { QueryTransactionEvent } from 'src/infrastructures/databases/schema/query-transaction-event.schema';
import { PaginateOrderEnum } from 'src/shared/enums/paginate-order.enum';
import { DataNotFoundException } from 'src/shared/exceptions/data-not-found.exception';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { MongooseQueryFilterUtil } from 'src/shared/utils/mongoose-query-filter';
import { MongooseQuerySortingUtil } from 'src/shared/utils/mongoose-query-sort.util';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { QueryTransactionEventPaginationV1Request } from '../dtos/requests/query-transaction-event-paginate-v1.request';

@Injectable()
export class QueryTransactionEventV1Repository {
    constructor(
        @InjectModel(QueryTransactionEvent.name)
        private readonly queryTransactionEventModel: Model<IQueryTransactionEvent>,
    ) {}

    async paginate(
        request: QueryTransactionEventPaginationV1Request,
    ): Promise<IPaginateData<IQueryTransactionEvent>> {
        // Define allowed sorts
        const ALLOWED_SORTS = new Map<string, string>([
            ['name', 'name'],
            ['status', 'status'],
            ['updated_at', 'updatedAt'],
            ['created_at', 'createdAt'],
        ]);

        // Validate sort parameter
        MongooseQueryFilterUtil.validateSortValueDto(request, ALLOWED_SORTS);

        const query = this.queryTransactionEventModel.find().select({
            id: 1,
            project: 1,
            queryId: 1,
            rawQuery: 1,
            executionTimeMs: 1,
            timestamp: 1,
            receivedAt: 1,
            environment: 1,
            severity: 1,
            createdAt: 1,
            updatedAt: 1,
        });

        // Apply filters and search using utility
        MongooseQueryFilterUtil.applyFilters(query, {
            search: request.search
                ? {
                      term: request.search,
                      fields: [
                          { name: 'rawQuery', type: 'string' },
                          { name: 'environment', type: 'string' },
                      ],
                  }
                : null,
            filters: [
                {
                    field: 'severity',
                    value: request.severity,
                    operator: 'eq',
                },
            ],
        });

        // Apply Sorting
        MongooseQuerySortingUtil.applySorting(query, {
            sort: request.sort || 'created_at',
            order: request.order || PaginateOrderEnum.DESC,
            allowedSorts: ALLOWED_SORTS,
        });

        // Apply Pagination
        const totalItems = await this.queryTransactionEventModel
            .find(query.getFilter())
            .countDocuments()
            .exec();

        const items = await query
            .skip(PaginationUtil.countOffset(request))
            .limit(request.perPage)
            .exec();

        const meta = PaginationUtil.mapMeta(totalItems, request);

        return {
            meta,
            items,
        };
    }

    async create(
        data: IQueryTransactionEvent,
    ): Promise<IQueryTransactionEvent> {
        const createdQueryTransactionEvent =
            new this.queryTransactionEventModel(data);
        return createdQueryTransactionEvent.save();
    }

    async findByIds(ids: string[]): Promise<IQueryTransactionEvent[]> {
        return (
            this.queryTransactionEventModel

                // eslint-disable-next-line @typescript-eslint/naming-convention
                .find({ _id: { $in: ids } })
                .exec()
        );
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
