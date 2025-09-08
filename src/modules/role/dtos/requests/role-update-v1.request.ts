import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const RoleUpdateV1Schema = z.object({
    name: z
        .string()
        .min(1, { message: 'Name cannot be empty string' })
        .optional(),

    // Optional, but if provided, must be a non-empty string
    // amd must have at least one permission
    permissionIds: z
        .array(z.string().uuid(), {
            required_error: 'Permission Ids are required',
        })
        .min(1, { message: 'At least one permission Id is required' })
        .optional(),
});

export class RoleUpdateV1Request extends ZodUtils.createCamelCaseDto(
    RoleUpdateV1Schema,
) {}
