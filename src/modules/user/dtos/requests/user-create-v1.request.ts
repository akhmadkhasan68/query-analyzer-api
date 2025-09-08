import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { REGEX } from 'src/shared/constants/regex.constant';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const UserCreateV1Schema = z.object({
    fullname: z.string().min(1, {
        message: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Fullname'),
    }),
    email: z.string().email(),
    password: z
        .string()
        .min(8, { message: ERROR_MESSAGE_CONSTANT.PasswordTooShort(8) })
        .regex(REGEX.PASSWORD, {
            message: ERROR_MESSAGE_CONSTANT.PasswordTooWeak,
        }),
    phoneNumber: z
        .string()
        .regex(REGEX.PHONE_NUMBER_ID, {
            message: ERROR_MESSAGE_CONSTANT.PhoneNumberInvalidFormatID,
        })
        .refine((val) => !isNaN(Number(val)), {
            message: ERROR_MESSAGE_CONSTANT.FieldInvalidValueWithName(
                'Phone number',
                'numeric',
            ),
        }),
    roleIds: z
        .array(z.string().uuid(), {
            required_error:
                ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Role Ids'),
        })
        .min(1, {
            message: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Role Ids'),
        }),
});

export class UserCreateV1Request extends ZodUtils.createCamelCaseDto(
    UserCreateV1Schema,
) {}
