import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const RolePermissionPaginationV1Schema = PaginateSchema.extend({
    slug: z.string().optional(),
});

export class RolePermissionPaginateV1Request extends ZodUtils.createCamelCaseDto(
    RolePermissionPaginationV1Schema,
) {}
