import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const PermissionUpdateV1Schema = z.object({
    name: z
        .string()
        .min(1, { message: 'Name cannot be empty string' })
        .optional(),
    description: z
        .string()
        .min(1, { message: 'Description cannot be empty string' })
        .optional(),
});

export class PermissionUpdateV1Request extends ZodUtils.createCamelCaseDto(
    PermissionUpdateV1Schema,
) {}
