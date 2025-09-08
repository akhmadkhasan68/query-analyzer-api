import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { REGEX } from 'src/shared/constants/regex.constant';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

const IamForgotPasswordResetV1Schema = z
    .object({
        token: z.string(),
        password: z
            .string()
            .min(8, { message: ERROR_MESSAGE_CONSTANT.PasswordTooShort(8) })
            .regex(REGEX.PASSWORD, {
                message: ERROR_MESSAGE_CONSTANT.PasswordTooWeak,
            }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: ERROR_MESSAGE_CONSTANT.PasswordNotMatch,
        path: ['confirmPassword'],
    });

export class IamForgotPasswordResetV1Request extends ZodUtils.createCamelCaseDto(
    IamForgotPasswordResetV1Schema,
) {}
