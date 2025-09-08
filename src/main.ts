import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { patchNestJsSwagger } from 'nestjs-zod';
import * as path from 'path';
import { AppModule } from './app.module';
import { config } from './config';
import { JwtAuthTypeEnum } from './modules/iam/shared/enums/token-type.enum';

async function bootstrap() {
    // Sentry
    sentry.init({
        dsn: config.sentry.dsn,
        debug: config.nodeEnv !== 'development',
        environment: config.nodeEnv,
        tracesSampleRate: config.sentry.tracesSampleRate,
        attachStacktrace: true,
        integrations: [
            nodeProfilingIntegration(),
            sentry.httpIntegration({
                breadcrumbs: true,
                spans: true,
            }),
            sentry.expressIntegration(),
            sentry.nestIntegration(),
        ],
    });

    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Enable CORS
    app.enableCors();

    // Set global prefix
    app.setGlobalPrefix('api');

    // Enable Versioning
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    // Storage Path
    const storagePath = path.join(__dirname, '..', config.storage.rootPath);
    app.useStaticAssets(storagePath, {
        prefix: `/${config.storage.rootPath}/`,
    });

    // Swagger setup
    patchNestJsSwagger();

    const swaggerConfig = new DocumentBuilder()
        .setTitle('API Documentation')
        .setDescription('API documentation for the application')
        .setVersion('1.0')
        .addTag('api')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT for access token',
                in: 'header',
            },
            JwtAuthTypeEnum.AccessToken,
        )
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT for refresh token',
                in: 'header',
            },
            JwtAuthTypeEnum.RefreshToken,
        )
        .build();

    const documentFactory = () =>
        SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, documentFactory);

    await app.listen(config.app.port);
}

bootstrap();
