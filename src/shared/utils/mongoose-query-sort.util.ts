import { Query } from 'mongoose';
import {
    OrderDirectionType,
    PaginateOrderEnum,
} from '../enums/paginate-order.enum';

export interface ISortOption {
    sort: string;
    order: OrderDirectionType;
    allowedSorts: Map<string, string>;
}

export class MongooseQuerySortingUtil {
    static applySorting<T>(
        query: Query<T[], T>,
        options: ISortOption,
    ): void {
        const sortKey = options.sort;
        const sortField = options.allowedSorts.get(sortKey) ?? 'updatedAt';
        const sortOrder = options.order === PaginateOrderEnum.DESC ? -1 : 1;
        
        query.sort({ [sortField]: sortOrder });
    }
}