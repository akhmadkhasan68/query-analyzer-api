import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const RoleCreateV1Schema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    permissionIds: z
        .array(z.string().uuid(), {
            required_error: 'Permission Ids are required',
        })
        .min(1, { message: 'At least one permission Id is required' }),
});

export class RoleCreateV1Request extends ZodUtils.createCamelCaseDto(
    RoleCreateV1Schema,
) {}
