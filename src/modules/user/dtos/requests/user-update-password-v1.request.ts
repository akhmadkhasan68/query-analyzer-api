import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { REGEX } from 'src/shared/constants/regex.constant';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const UserUpdatePasswordV1Schema = z.object({
    newPassword: z
        .string()
        .min(8, { message: ERROR_MESSAGE_CONSTANT.PasswordTooShort(8) })
        .regex(REGEX.PASSWORD, {
            message: ERROR_MESSAGE_CONSTANT.PasswordTooWeak,
        }),
});

export class UserUpdatePasswordV1Request extends ZodUtils.createCamelCaseDto(
    UserUpdatePasswordV1Schema,
) {}
