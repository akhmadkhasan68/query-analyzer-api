import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const ResourcePaginateV1Schema = PaginateSchema.extend({
    slug: z.string().optional(),
});

export class ResourcePaginateV1Request extends ZodUtils.createCamelCaseDto(
    ResourcePaginateV1Schema,
) {}
