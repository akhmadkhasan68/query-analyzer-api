 

/**
 * Paginate Util
 * Used to paginate the data
 */
import { IPaginateMeta } from '../interfaces/paginate-response.interface';
import { IPaginateRequest } from '../interfaces/request.interface';

const defaultPerPage = 10;
const defaultPage = 1;

export class PaginationUtil {
    static countOffset({
        page = defaultPage,
        perPage = defaultPerPage,
    }: IPaginateRequest): number {
        page = page;
        perPage = perPage ?? defaultPerPage;

        return (page - 1) * perPage;
    }

    static mapMeta(
        count: number,
        { page = defaultPage, perPage = defaultPerPage }: IPaginateRequest,
    ): IPaginateMeta {
        page = page;
        perPage = perPage;

        return {
            page: page,
            perPage: perPage,
            total: count,
            totalPage: Math.ceil(count / perPage),
        };
    }
}
