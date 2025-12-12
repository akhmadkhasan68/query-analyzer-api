import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

const IamAuthOauth2V1Schema = z.object({
    code: z.string(),
});

export class IamAuthOauth2V1Request extends ZodUtils.createCamelCaseDto(
    IamAuthOauth2V1Schema,
) {}
