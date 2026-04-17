import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const GitlabFileV1Schema = z.object({
    filePath: z.string().min(1, {
        message: 'Field file_path is required',
    }),
    ref: z.string().default('main'),
});

export class GitlabFileV1Request extends ZodUtils.createCamelCaseDto(
    GitlabFileV1Schema,
) {}
