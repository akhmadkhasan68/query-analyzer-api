import { IBasicResponse } from './basic-response.interface';

/**
 * IPaginateMeta interface represents the metadata for pagination.
 * It includes the current page, number of items per page, total number of items,
 * and total number of pages.
 * @param page - The current page number.
 * @param perPage - The number of items per page.
 * @param total - The total number of items.
 * @param totalPage - The total number of pages.
 */
export interface IPaginateMeta {
    page: number;
    perPage: number;
    total: number;
    totalPage: number;
}

/**
 * IPaginateData interface represents the data structure for paginated responses.
 * It includes an array of items and metadata for pagination.
 * @param items - An array of items of type T.
 * @param meta - Metadata for pagination.
 */
export interface IPaginateData<T> {
    items: T[];
    meta: IPaginateMeta;
}

/**
 * IPaginationResponse interface represents the structure of a paginated response.
 * It extends the IBasicResponse interface and includes metadata for pagination.
 * @param T - Type of the data.
 * @param data - The paginated data, including items and metadata.
 * @param message - A message indicating the status of the response.
 */
export interface IPaginationResponse<T>
    extends IBasicResponse<IPaginateData<T>> {
    data: {
        items: T[];
        meta: IPaginateMeta;
    };
}
