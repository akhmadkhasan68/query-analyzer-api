import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const UserImportCsvV1Schema = z.object({
    delimiter: z
        .string()
        .length(1, { message: 'Delimiter harus berupa satu karakter.' })
        .optional()
        .default(';'),
});

export class UserImportCsvV1Request extends ZodUtils.createCamelCaseDto(
    UserImportCsvV1Schema,
) {}
