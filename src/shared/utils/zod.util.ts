import { createZodDto, ZodValidationException } from 'nestjs-zod';
import { z, ZodType } from 'zod';
import { IZodValidationErrorFormat } from '../interfaces/zod-validation-error-format.interface';
import { StringUtil } from './string.util';

export class ZodUtils {
    static createCamelCaseDto<T extends z.ZodTypeAny>(schema: T) {
        return createZodDto(
            z.preprocess((data) => {
                if (typeof data === 'object' && data !== null) {
                    return StringUtil.camelCaseKey(data as Record<string, any>);
                }
                return data;
            }, schema),
        );
    }

    // TODO: Remove this deprecated method
    // static createSnakeCaseToCamelDto<T extends z.ZodObject<any>>(schema: T) {
    //     return createZodDto(
    //         z.preprocess((data) => {
    //             if (typeof data === 'object' && data !== null) {
    //                 return StringUtil.camelCaseKey(data as Record<string, any>);
    //             }
    //             return data;
    //         }, schema),
    //     );
    // }

    static toBoolean(): ZodType<boolean, z.ZodTypeDef, unknown> {
        return z.preprocess((val: unknown) => {
            if (
                typeof val === 'string' ||
                typeof val === 'number' ||
                typeof val === 'boolean'
            ) {
                const truthy = ['true', '1', 1, true];
                const falsy = ['false', '0', 0, false];
                if (truthy.includes(val)) return true;
                if (falsy.includes(val)) return false;
            }
            return val;
        }, z.boolean());
    }

    static zodValidationResponseFormat(
        exception: ZodValidationException,
    ): IZodValidationErrorFormat[] {
        const issues = exception.getZodError().issues;

        const errorMap = new Map<string, string[]>();

        issues.forEach((issue) => {
            const pathString = issue.path
                .map((item) => StringUtil.snakeCase(item.toString()))
                .join('.');
            const existingMessages = errorMap.get(pathString) || [];

            existingMessages.push(issue.message);

            errorMap.set(pathString, existingMessages);
        });

        const result: IZodValidationErrorFormat[] = [];

        errorMap.forEach((messages, path) => {
            result.push({
                path,
                messages,
            });
        });

        return result;
    }
}
