import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

const IamForgotPasswordVerifyV1Schema = z.object({
    token: z.string(),
});

export class IamForgotPasswordVerifyV1Request extends ZodUtils.createCamelCaseDto(
    IamForgotPasswordVerifyV1Schema,
) {}
