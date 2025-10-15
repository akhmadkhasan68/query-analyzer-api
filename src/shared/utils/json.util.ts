export class JsonUtil {
    static parse<T>(jsonString: string): T | null {
        try {
            const parsed = JSON.parse(jsonString);
            return this.transformObject<T>(parsed);
        } catch (error) {
            console.error('Failed to parse JSON string:', error);
            return null;
        }
    }

    /**
     * Transform object by converting snake_case keys to camelCase recursively
     */
    private static transformObject<T>(obj: any): T {
        if (obj === null || obj === undefined) {
            return obj;
        }

        // Handle arrays
        if (Array.isArray(obj)) {
            return obj.map((item) => this.transformObject(item)) as any;
        }

        // Handle objects
        if (typeof obj === 'object' && obj.constructor === Object) {
            const transformed: any = {};

            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const camelKey = this.snakeToCamel(key);
                    transformed[camelKey] = this.transformObject(obj[key]);
                }
            }

            return transformed as T;
        }

        // Return primitives as-is
        return obj;
    }

    /**
     * Convert snake_case to camelCase
     */
    private static snakeToCamel(str: string): string {
        return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }

    static stringify(obj: any, space: number = 2): string {
        try {
            return JSON.stringify(obj, null, space);
        } catch (error) {
            console.error('Failed to stringify object:', error);
            return '';
        }
    }
}
