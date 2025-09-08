import { z } from 'zod';
import { PaginateOrderEnum } from '../../enums/paginate-order.enum';
import { ZodUtils } from '../../utils/zod.util';

export const PaginateSchema = z.object({
    sort: z.string().default('updated_at'),
    order: z.nativeEnum(PaginateOrderEnum).default(PaginateOrderEnum.DESC),
    perPage: z.coerce
        .number()
        .min(1, { message: 'perPage must be at least 1' })
        .default(10),
    page: z.coerce
        .number()
        .min(1, { message: 'page must be at least 1' })
        .default(1),
    search: z.string().optional(),
});

export class PaginateRequest extends ZodUtils.createCamelCaseDto(
    PaginateSchema,
) {}
