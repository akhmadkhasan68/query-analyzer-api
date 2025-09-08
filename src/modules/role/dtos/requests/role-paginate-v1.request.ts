import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const RolePaginationV1Schema = PaginateSchema.extend({
    slug: z.string().optional(),
});

export class RolePaginateV1Request extends ZodUtils.createCamelCaseDto(
    RolePaginationV1Schema,
) {}
