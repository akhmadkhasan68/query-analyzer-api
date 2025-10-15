import { DynamicModule, Module } from '@nestjs/common';
import { HttpModule } from 'nestjs-http-promise';
import { HttpIntegrationV1Service } from './http-integration-v1.service';
import {
    AuthorizationType,
    IHttpIntegrationModuleAsyncOptions,
    IHttpIntegrationModuleOptions,
} from './shared/interfaces/http-integration-options.interface';

@Module({})
export class HttpIntegrationModule {
    static register(
        options: IHttpIntegrationModuleOptions = {},
        name?: string,
    ): DynamicModule {
        const httpModuleConfig = this.createHttpConfig(options);
        const providerToken = name ? name : HttpIntegrationV1Service;

        return {
            module: HttpIntegrationModule,
            imports: [HttpModule.register(httpModuleConfig)],
            providers: [
                {
                    provide: providerToken,
                    useClass: HttpIntegrationV1Service,
                },
            ],
            exports: [providerToken],
        };
    }

    static registerAsync(
        options: IHttpIntegrationModuleAsyncOptions,
    ): DynamicModule {
        return {
            module: HttpIntegrationModule,
            imports: [
                HttpModule.registerAsync({
                    useFactory: async (...args: any[]) => {
                        const moduleOptions = await options.useFactory?.(
                            ...args,
                        );
                        return this.createHttpConfig(moduleOptions || {});
                    },
                    inject: options.inject || [],
                }),
            ],
            providers: [HttpIntegrationV1Service],
            exports: [HttpIntegrationV1Service],
        };
    }

    private static createHttpConfig(options: IHttpIntegrationModuleOptions) {
        const config: any = {
            timeout: options.timeout || 5000,
            maxRedirects: options.maxRedirects || 5,
        };

        if (options.baseURL) {
            config.baseURL = options.baseURL;
        }

        // Merge custom headers from options
        if (options.headers) {
            config.headers = { ...options.headers };
        }

        if (options.authorizationType && options.authorizationToken) {
            config.headers = config.headers || {};

            switch (options.authorizationType) {
                case AuthorizationType.Bearer:
                    config.headers.Authorization = `Bearer ${options.authorizationToken}`;
                    break;
                case AuthorizationType.Basic:
                    config.headers.Authorization = `Basic ${options.authorizationToken}`;
                    break;
                case AuthorizationType.ApiKey:
                    config.headers['X-API-Key'] = options.authorizationToken;
                    break;
            }
        }

        return config;
    }
}
