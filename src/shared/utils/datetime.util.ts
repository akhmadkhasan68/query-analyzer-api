/**
 * @description
 * Utility class for date and time manipulation
 * @export
 * @class DateTimeUtil
 */
export class DateTimeUtil {
    /**
     * @description
     * Get the current date and time
     * @returns {Date}
     * @memberof DateTimeUtil
     */
    static addSeconds(date: Date, seconds: number): Date {
        const newDate = new Date(date);
        newDate.setSeconds(newDate.getSeconds() + seconds);
        return newDate;
    }

    static parseDatetime(obj: { [x: string]: any }, timezone: string): any {
        if (typeof obj != 'object') {
            return obj;
        }

        for (const oldName in obj) {
            // Recursion
            if (typeof obj[oldName] == 'object') {
                obj[oldName] = DateTimeUtil.parseDatetime(
                    obj[oldName],
                    timezone,
                );
            }
        }

        if (obj instanceof Date) {
            const date = new Date(obj);

            return date;
        }

        return obj;
    }

    static convertSecondsToMilliseconds(seconds: number): number {
        if (seconds < 0) {
            throw new Error('Invalid input: seconds cannot be negative');
        }

        return seconds * 1000;
    }
}
