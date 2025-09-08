import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const PermissionCreateV1Schema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    description: z
        .string()
        .min(1, {
            message: 'Description cannot be empty string',
        })
        .optional(),
});

export class PermissionCreateV1Request extends ZodUtils.createCamelCaseDto(
    PermissionCreateV1Schema,
) {}
