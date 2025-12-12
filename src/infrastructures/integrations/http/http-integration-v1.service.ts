import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from 'nestjs-http-promise';

@Injectable()
export class HttpIntegrationV1Service {
    constructor(private readonly httpService: HttpService) {}

    private readonly logger = new Logger(HttpIntegrationV1Service.name);

    async get<T, R>(
        endpoint: string,
        params?: T,
        headers?: Record<any, any>,
    ): Promise<R> {
        try {
            const { data } = await this.httpService.get<R>(endpoint, {
                params,
                headers: headers,
            });

            return data;
        } catch (error) {
            // this.logger.error(
            //     `Error occurred while GET ${endpoint}: ${error.message}`,
            // );

            throw error;
        }
    }

    async post<T, R>(
        endpoint: string,
        body: T,
        headers?: Record<any, any>,
    ): Promise<R> {
        this.logger.log(`
            Method: POST
            Base URL: ${this.httpService.axiosRef.defaults.baseURL}
            Endpoint: ${endpoint}
            Body: ${JSON.stringify(body)}
        `);

        try {
            const { data } = await this.httpService.post<R>(
                endpoint,
                body,
                headers,
            );

            return data;
        } catch (error) {
            throw error;
        }
    }

    async put<T, R>(
        endpoint: string,
        body: T,
        headers?: Record<any, any>,
    ): Promise<R> {
        try {
            const { data } = await this.httpService.put<R>(
                endpoint,
                body,
                headers,
            );

            return data;
        } catch (error) {
            this.logger.error(
                `Error occurred while PUT ${endpoint}: ${error.message}`,
            );

            throw error;
        }
    }

    async patch<T, R>(
        endpoint: string,
        body: T,
        headers?: Record<any, any>,
    ): Promise<R> {
        try {
            const { data } = await this.httpService.patch<R>(
                endpoint,
                body,
                headers,
            );

            return data;
        } catch (error) {
            this.logger.error(
                `Error occurred while PATCH ${endpoint}: ${error.message}`,
            );

            throw error;
        }
    }

    async delete<R>(endpoint: string, headers?: Record<any, any>): Promise<R> {
        try {
            const { data } = await this.httpService.delete<R>(
                endpoint,
                headers,
            );

            return data;
        } catch (error) {
            this.logger.error(
                `Error occurred while DELETE ${endpoint}: ${error.message}`,
            );

            throw error;
        }
    }
}
