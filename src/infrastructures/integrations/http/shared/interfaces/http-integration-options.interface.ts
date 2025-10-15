export class AuthorizationType {
    static readonly Bearer = 'Bearer';
    static readonly Basic = 'Basic';
    static readonly ApiKey = 'ApiKey';
}

export type AuthorizationTypes =
    | typeof AuthorizationType.Bearer
    | typeof AuthorizationType.Basic
    | typeof AuthorizationType.ApiKey;

export interface IHttpIntegrationModuleOptions {
    authorizationType?: AuthorizationTypes;
    authorizationToken?: string;
    baseURL?: string;
    timeout?: number;
    maxRedirects?: number;
    headers?: Record<string, string>;
}

export interface IHttpIntegrationModuleAsyncOptions {
    useFactory?: (
        ...args: any[]
    ) => Promise<IHttpIntegrationModuleOptions> | IHttpIntegrationModuleOptions;
    inject?: any[];
}
