import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

const IamForgotPasswordV1Schema = z.object({
    email: z.string().email(),
    redirectUrl: z.string().url().optional(),
});
export class IamForgotPasswordV1Request extends ZodUtils.createCamelCaseDto(
    IamForgotPasswordV1Schema,
) {}
