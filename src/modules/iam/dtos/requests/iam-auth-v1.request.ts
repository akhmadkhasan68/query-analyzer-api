import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

const IamAuthV1Schema = z.object({
    email: z.string(),
    password: z.string(),
});

export class IamAuthV1Request extends ZodUtils.createCamelCaseDto(
    IamAuthV1Schema,
) {}
