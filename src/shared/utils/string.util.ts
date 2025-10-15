import * as _ from 'lodash';

/**
 * StringUtil
 * @description Utility class for string manipulation
 * @export
 * @class StringUtil
 */
export class StringUtil {
    /**
     * convert string to snake case
     * @param string
     */
    static snakeCase(string: string): string {
        return _.snakeCase(string);
    }

    /**
     * convert string to camel case
     * @param string
     * @returns {string}
     */
    static snakeCaseKey(obj: { [x: string]: any }): { [x: string]: any } {
        if (typeof obj != 'object') return obj;

        for (const oldName in obj) {
            // Camel to underscore
            const newName = _.snakeCase(oldName);

            // Only process if names are different
            if (newName != oldName) {
                // Check for the old property name to avoid a ReferenceError in strict mode.
                if (obj.hasOwnProperty(oldName)) {
                    obj[newName] = obj[oldName];
                    delete obj[oldName];
                }
            }

            // Recursion
            if (typeof obj[newName] == 'object') {
                obj[newName] = StringUtil.snakeCaseKey(obj[newName]);
            }
        }
        return obj;
    }

    /**
     * convert string to camel case
     * @param string
     */
    static snakeCaseKeyObj(obj: { [x: string]: any }): { [x: string]: any } {
        if (typeof obj != 'object') return obj;

        for (const oldName in obj) {
            // Camel to underscore
            const newName = _.snakeCase(oldName);

            // Only process if names are different
            if (newName != oldName) {
                // Check for the old property name to avoid a ReferenceError in strict mode.
                if (obj.hasOwnProperty(oldName)) {
                    obj[newName] = obj[oldName];
                    delete obj[oldName];
                }
            }

            // Recursion
            if (typeof obj[newName] == 'object') {
                obj[newName] = StringUtil.snakeCaseKeyObj(obj[newName]);
            }
        }
        return obj;
    }

    /**
     * camel case object key
     * @param obj
     */
    static camelCaseKey(obj: { [x: string]: any }): { [x: string]: any } {
        if (typeof obj != 'object') return obj;

        for (const oldName in obj) {
            // anything to camel case
            const newName = _.camelCase(oldName);

            // Only process if names are different
            if (newName != oldName) {
                // Check for the old property name to avoid a ReferenceError in strict mode.
                if (Object.prototype.hasOwnProperty.call(obj, oldName)) {
                    obj[newName] = obj[oldName];
                    delete obj[oldName];
                }
            }

            // Recursion
            if (typeof obj[newName] == 'object') {
                obj[newName] = StringUtil.camelCaseKey(obj[newName]);
            }
        }
        return obj;
    }

    static camelCaseKeyObj(obj: { [x: string]: any }): { [x: string]: any } {
        if (typeof obj != 'object') return obj;

        for (const oldName in obj) {
            const newName = _.camelCase(oldName);

            if (newName != oldName) {
                if (obj.hasOwnProperty(oldName)) {
                    obj[newName] = obj[oldName];
                    delete obj[oldName];
                }
            }

            if (typeof obj[newName] == 'object') {
                obj[newName] = StringUtil.camelCaseKeyObj(obj[newName]);
            }
        }
        return obj;
    }

    static maskedString(
        str: string,
        unmaskedStartLength = 4,
        unmaskedEndLength = 4,
    ): string {
        if (!str || str.length <= unmaskedStartLength + unmaskedEndLength) {
            return str;
        }
        const start = str.substring(0, unmaskedStartLength);
        const end = str.substring(str.length - unmaskedEndLength);
        const maskedLength =
            str.length - unmaskedStartLength - unmaskedEndLength;
        const masked = '*'.repeat(maskedLength);
        return `${start}${masked}${end}`;
    }

    static convertToTitleCase(str: string): string {
        const strToLowerCase = str.toLowerCase();
        return strToLowerCase.replace(/\b\w/g, (char: string): string =>
            char.toUpperCase(),
        );
    }

    static convertToUpperSnakeCase(str: string): string {
        return str.toUpperCase().replace(/ /g, '_');
    }

    static convertToSlugCase(str: string): string {
        return _.kebabCase(str);
    }

    static slugToTitleCase(str: string): string {
        return `${str}`
            .replace(/[-_.]/g, ' ')
            .replace(/\b\w/g, (char: string): string => char.toUpperCase());
    }

    static truncateText(text: string, maxLength = 3000): string {
        if (text.length < maxLength) {
            return text;
        }
        return text.substring(0, maxLength - 3) + '...';
    }
}
