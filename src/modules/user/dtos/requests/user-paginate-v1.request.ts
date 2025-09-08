import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const UserPaginateV1Schema = PaginateSchema.extend({
    emailVerfied: z.boolean().optional(),
    phoneNumberVerified: z.boolean().optional(),
});

export class UserPaginateV1Request extends ZodUtils.createCamelCaseDto(
    UserPaginateV1Schema,
) {}
