import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from 'nestjs-http-promise';

@Injectable()
export class HttpIntegrationV1Service {
    constructor(private readonly httpService: HttpService) {}

    private readonly logger = new Logger(HttpIntegrationV1Service.name);

    async get<T, R>(endpoint: string, params?: T): Promise<R> {
        try {
            this.logger.log(
                `GET ${endpoint} with params: ${JSON.stringify(params)}`,
            );

            const { data } = await this.httpService.get<R>(endpoint, {
                params,
            });

            this.logger.log(
                `Response from GET ${endpoint}: ${JSON.stringify(data)}`,
            );

            return data;
        } catch (error) {
            this.logger.error(
                `Error occurred while GET ${endpoint}: ${error.message}`,
            );
            throw error;
        }
    }

    async post<T, R>(endpoint: string, body: T): Promise<R> {
        try {
            this.logger.log(
                `POST ${endpoint} with body: ${JSON.stringify(body)}`,
            );

            const { data } = await this.httpService.post<R>(endpoint, body);

            this.logger.log(
                `Response from POST ${endpoint}: ${JSON.stringify(data)}`,
            );

            return data;
        } catch (error) {
            this.logger.error(
                `Error occurred while POST ${endpoint}: ${error.message}`,
            );
            throw error;
        }
    }

    async put<T, R>(endpoint: string, body: T): Promise<R> {
        try {
            this.logger.log(
                `PUT ${endpoint} with body: ${JSON.stringify(body)}`,
            );

            const { data } = await this.httpService.put<R>(endpoint, body);

            this.logger.log(
                `Response from PUT ${endpoint}: ${JSON.stringify(data)}`,
            );

            return data;
        } catch (error) {
            this.logger.error(
                `Error occurred while PUT ${endpoint}: ${error.message}`,
            );
            throw error;
        }
    }

    async patch<T, R>(endpoint: string, body: T): Promise<R> {
        try {
            this.logger.log(
                `PATCH ${endpoint} with body: ${JSON.stringify(body)}`,
            );

            const { data } = await this.httpService.patch<R>(endpoint, body);

            this.logger.log(
                `Response from PATCH ${endpoint}: ${JSON.stringify(data)}`,
            );

            return data;
        } catch (error) {
            this.logger.error(
                `Error occurred while PATCH ${endpoint}: ${error.message}`,
            );
            throw error;
        }
    }

    async delete<R>(endpoint: string): Promise<R> {
        try {
            this.logger.log(`DELETE ${endpoint}`);

            const { data } = await this.httpService.delete<R>(endpoint);

            this.logger.log(
                `Response from DELETE ${endpoint}: ${JSON.stringify(data)}`,
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
