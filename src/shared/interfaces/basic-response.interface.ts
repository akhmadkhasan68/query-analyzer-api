/**
 * Basic Response Interface
 * @param T - Type of the data
 * @param message - Message indicating the status of the response
 * @param data - The data returned in the response
 */
export interface IBasicResponse<T> {
    message: string;
    data?: T;
}

/**
 * Basic Response with Pagination
 * @param T - Type of the data
 * @param message - Message indicating the status of the response
 * @param errors - Array of errors
 */
export interface IBasicErrorResponse extends IBasicResponse<undefined> {
    errors: any;
}
