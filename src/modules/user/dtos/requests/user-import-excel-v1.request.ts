import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const UserImportExcelV1Schema = z.object({
    sheetName: z
        .string()
        .min(1, { message: 'Sheet name cannot be empty string' })
        .optional(),
});

export class UserImportExcelV1Request extends ZodUtils.createCamelCaseDto(
    UserImportExcelV1Schema,
) {}
