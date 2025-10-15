import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryModule } from '@sentry/nestjs/setup';
import { ZodValidationPipe } from 'nestjs-zod';
import { join } from 'path';
import { config } from './config';
import { databaseConfig } from './infrastructures/databases/config';
import { ResponseInterceptor } from './infrastructures/interceptors/response.interceptor';
import { HealthModule } from './modules/health/health.module';
import { IamModule } from './modules/iam/iam.module';
import { JwtAuthGuard } from './modules/iam/shared/guards/jwt-auth.guard';
import { PermissionGuard } from './modules/iam/shared/guards/permission.guard';
import { LogActivityModule } from './modules/log-activity/log-activity.module';
import { N8nModule } from './modules/n8n/n8n.module';
import { OperationModule } from './modules/operation/operation.module';
import { PermissionModule } from './modules/permission/permission.module';
import { PlatformModule } from './modules/platform/platform.module';
import { ProjectModule } from './modules/project/project.module';
import { QueryTransactionModule } from './modules/query-transaction/query-transaction.module';
import { ResourceModule } from './modules/resource/resource.module';
import { RoleModule } from './modules/role/role.module';
import { SlackModule } from './modules/slack/slack.module';
import { StorageFileModule } from './modules/storage-file/storage-file.module';
import { UserModule } from './modules/user/user.module';
import { GlobalExceptionHandlerFilter } from './shared/filters/global-exception.filter';
import { DateTimeUtil } from './shared/utils/datetime.util';

@Module({
    imports: [
        SentryModule.forRoot(),
        TypeOrmModule.forRoot(databaseConfig),
        MongooseModule.forRoot(config.db.analyticsConnectionString),
        BullModule.forRoot({
            connection: {
                host: config.redis.host,
                port: config.redis.port,
                password: config.redis.password,
            },
            prefix: `${config.app.name}:${config.app.env}:bull`,
            defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: true,
                attempts: config.queue.retryAttempts,
                backoff: {
                    type: 'exponential',
                    delay: DateTimeUtil.convertSecondsToMilliseconds(
                        config.queue.backoffDelayInSeconds,
                    ),
                },
            },
        }),
        MailerModule.forRoot({
            transport: {
                host: config.smtp.host,
                port: config.smtp.port,
                secure: false,
                ...(config.smtp.user && config.smtp.password
                    ? {
                          auth: {
                              user: config.smtp.user,
                              pass: config.smtp.password,
                          },
                      }
                    : {}),
            },
            defaults: {
                from: `"No Reply" <${config.smtp.emailSender}>`,
            },
            template: {
                dir: join(
                    __dirname,
                    './infrastructures/modules/mail/templates',
                ),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        }),
        HealthModule,
        IamModule,
        LogActivityModule,
        OperationModule,
        PermissionModule,
        ResourceModule,
        RoleModule,
        StorageFileModule,
        UserModule,
        ProjectModule,
        PlatformModule,
        QueryTransactionModule,
        SlackModule,
        N8nModule,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionHandlerFilter,
        },
        {
            provide: APP_PIPE,
            useClass: ZodValidationPipe,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: PermissionGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor,
        },
    ],
})
export class AppModule {}
