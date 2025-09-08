import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { REGEX } from 'src/shared/constants/regex.constant';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const UserUpdateV1Schema = z.object({
    fullname: z.string().min(1, {
        message: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Fullname'),
    }),
    email: z.string().email(),
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
    // Optional, but if provided, must be a non-empty string
    // amd must have at least one permission
    roleIds: z
        .array(z.string().uuid(), {
            required_error:
                ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Role Ids'),
        })
        .min(1, {
            message: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Role Ids'),
        })
        .optional(),
});

export class UserUpdateV1Request extends ZodUtils.createCamelCaseDto(
    UserUpdateV1Schema,
) {}
