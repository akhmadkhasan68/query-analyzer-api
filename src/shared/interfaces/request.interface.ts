import { OrderDirectionType } from '../enums/paginate-order.enum';

export interface ISortRequest {
    sort?: string;
    order?: OrderDirectionType;
}

export interface IPaginateRequest {
    perPage?: number;
    page?: number;
}
