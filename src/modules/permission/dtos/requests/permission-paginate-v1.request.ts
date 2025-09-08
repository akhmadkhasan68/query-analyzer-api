import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const PermissionPaginateV1Schema = PaginateSchema.extend({
    slug: z.string().optional(),
});

export class PermissionPaginateV1Request extends ZodUtils.createCamelCaseDto(
    PermissionPaginateV1Schema,
) {}
