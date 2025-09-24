import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const PlatformPaginateV1Schema = PaginateSchema.extend({
    framework: z.string().optional(),
    ormProvider: z.string().optional(),
    databaseProvider: z.string().optional(),
});

export class PlatformPaginateV1Request extends ZodUtils.createCamelCaseDto(
    PlatformPaginateV1Schema,
) {}
