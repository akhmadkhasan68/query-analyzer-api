import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ConflictException,
    ExceptionFilter,
    ForbiddenException,
    HttpException,
    HttpStatus,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import * as sentry from '@sentry/nestjs';
import { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { config } from 'src/config';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { ERROR_MESSAGE_CONSTANT } from '../constants/error-message.constant';
import { DataNotFoundException } from '../exceptions/data-not-found.exception';
import { IErrorResponse } from '../interfaces/response.interface';
import { ZodUtils } from '../utils/zod.util';

interface IErrorResponseWithStatus extends IErrorResponse {
    status?: number;
}

@Catch()
export class GlobalExceptionHandlerFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionHandlerFilter.name);

    catch(exception: any, host: ArgumentsHost): void {
        const applicationContext = host.getType();

        if (applicationContext === 'http') {
            // Handle for application context of regular HTTP requests (REST)
            this.httpExceptionResponse(exception, host);
            return;
        } else if (applicationContext === 'rpc') {
            // Handle for application context of RPC (Microservice requests)
            //TODO: implement this
        } else if (applicationContext === 'ws') {
            // Handle for application context of WS (Websocket requests)
            //TODO: implement this
        }

        this.logger.error(exception, exception.stack);

        sentry.captureException(exception);
    }

    private httpExceptionResponse(
        exception: HttpException,
        host: ArgumentsHost,
    ): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        let status = exception.getStatus
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const responseData = this.httpExceptionResponseData(exception);

        // If responseData has status, override the status
        if (responseData.status) {
            status = responseData.status;
        }

        // Sentry Capture Error Exception
        const capturedStatusCodes = [
            HttpStatus.INTERNAL_SERVER_ERROR,
            HttpStatus.NOT_IMPLEMENTED,
            HttpStatus.BAD_GATEWAY,
            HttpStatus.SERVICE_UNAVAILABLE,
            HttpStatus.GATEWAY_TIMEOUT,
            HttpStatus.HTTP_VERSION_NOT_SUPPORTED,
        ];

        if (capturedStatusCodes.includes(status)) {
            sentry.captureException(exception);
        }

        response.status(status).json(responseData);
    }

    private httpExceptionResponseData(
        exception: HttpException,
    ): IErrorResponseWithStatus {
        const returnDataMap = new Map<string, () => IErrorResponseWithStatus>([
            // Built-in Exception
            [
                UnprocessableEntityException.name,
                (): IErrorResponseWithStatus => {
                    return {
                        message: ERROR_MESSAGE_CONSTANT.UnprocessableEntity,
                        error: exception.message,
                    };
                },
            ],
            [
                UnauthorizedException.name,
                (): IErrorResponseWithStatus => ({
                    message: ERROR_MESSAGE_CONSTANT.Unauthorized,
                    error: exception.message,
                }),
            ],
            [
                ForbiddenException.name,
                (): IErrorResponseWithStatus => ({
                    message: ERROR_MESSAGE_CONSTANT.ForbiddenAccess,
                    error: exception.message,
                }),
            ],
            [
                NotFoundException.name,
                (): IErrorResponseWithStatus => ({
                    message: ERROR_MESSAGE_CONSTANT.NotFound,
                    error: exception.message,
                }),
            ],
            [
                InternalServerErrorException.name,
                (): IErrorResponseWithStatus => ({
                    message: ERROR_MESSAGE_CONSTANT.InternalServerError,
                    error: exception.message,
                }),
            ],
            [
                BadRequestException.name,
                (): IErrorResponseWithStatus => ({
                    message: ERROR_MESSAGE_CONSTANT.BadRequest,
                    error: exception.message,
                }),
            ],
            [
                ConflictException.name,
                (): IErrorResponseWithStatus => ({
                    message: ERROR_MESSAGE_CONSTANT.Conflict,
                    error: exception.message,
                }),
            ],
            [
                DataNotFoundException.name,
                (): IErrorResponseWithStatus => ({
                    message: ERROR_MESSAGE_CONSTANT.DataNotFound,
                    error: exception.message,
                }),
            ],
            // Zod Validation Error
            [
                ZodValidationException.name,
                (): IErrorResponseWithStatus => {
                    const zodValidationException =
                        exception as ZodValidationException;
                    const zodValidationResponseFormat =
                        ZodUtils.zodValidationResponseFormat(
                            zodValidationException,
                        );

                    return {
                        message: ERROR_MESSAGE_CONSTANT.ValidationError,
                        errors: zodValidationResponseFormat,
                    };
                },
            ],
            // TypeORM Error
            [
                EntityNotFoundError.name,
                (): IErrorResponseWithStatus => {
                    const match = exception.message.match(
                        /entity of type "(.+?)"/,
                    );
                    const entity = match?.[1] ?? 'Resource';
                    const message = `${entity} not found.`;

                    return {
                        message: ERROR_MESSAGE_CONSTANT.NotFound,
                        error: message,
                        status: HttpStatus.NOT_FOUND,
                    };
                },
            ],
            [
                QueryFailedError.name,
                (): IErrorResponseWithStatus => {
                    return {
                        message: ERROR_MESSAGE_CONSTANT.QueryError,
                        error:
                            config.nodeEnv == 'development'
                                ? exception.message
                                : ERROR_MESSAGE_CONSTANT.QueryError,
                    };
                },
            ],
        ]);

        const returnData = returnDataMap.get(exception.constructor.name);
        if (returnData) {
            return returnData();
        }

        // Capture for unhandled exception type
        this.logger.error(exception);
        this.logger.error(
            `Unhandled exception: ${exception.message}`,
            exception.stack,
        );

        sentry.captureException(exception);

        return {
            message: ERROR_MESSAGE_CONSTANT.InternalServerError,
            error:
                exception.message || ERROR_MESSAGE_CONSTANT.InternalServerError,
        };
    }
}
