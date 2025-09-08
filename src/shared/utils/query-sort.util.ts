import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import {
    OrderDirectionType,
    PaginateOrderEnum,
} from '../enums/paginate-order.enum';

export interface ISortOption {
    sort: string;
    order: OrderDirectionType;
    allowedSorts: Map<string, string>;
}

export class QuerySortingUtil {
    static applySorting<T extends ObjectLiteral>(
        query: SelectQueryBuilder<T>,
        options: ISortOption,
    ): void {
        const sortKey = options.sort;
        const sortField = options.allowedSorts.get(sortKey) ?? 'updated_at';
        query.orderBy(sortField, options.order ?? PaginateOrderEnum.DESC);
    }
}
