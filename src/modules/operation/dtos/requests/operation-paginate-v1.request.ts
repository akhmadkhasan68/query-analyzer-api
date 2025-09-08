import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const OperationPaginateV1Schema = PaginateSchema.extend({
    slug: z.string().optional(),
});

export class OperationPaginateV1Request extends ZodUtils.createCamelCaseDto(
    OperationPaginateV1Schema,
) {}
