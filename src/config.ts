import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
    nodeEnv: process.env.NODE_ENV ?? 'development',

    app: {
        name: process.env.APP_NAME ?? 'NestJS Boilerplate',
        env: process.env.APP_ENV ?? 'development',
        key: process.env.APP_KEY ?? 'base64:randomkey',
        debug: process.env.APP_DEBUG === 'true',
        port: +(process.env.APP_PORT ?? 3000),
        tz: process.env.APP_TZ ?? 'UTC',
        isDevelopment: ((): boolean => {
            const env = process.env.APP_ENV ?? 'development';
            return env === 'development' || env === 'local';
        })(),
        isProduction: ((): boolean => {
            const env = process.env.APP_ENV ?? 'development';
            return env === 'production';
        })(),
        url: process.env.APP_URL ?? 'http://localhost',
    },
    db: {
        host: process.env.DB_HOST ?? '127.0.0.1',
        port: +(process.env.DB_PORT ?? 5432),
        database: process.env.DB_DATABASE ?? 'database',
        username: process.env.DB_USERNAME ?? 'user',
        password: process.env.DB_PASSWORD ?? 'password',
        deletedRecordPrefix: process.env.DB_DELETED_RECORD_PREFIX ?? 'deleted',
        poolSize: +(process.env.DB_POOL_SIZE ?? 10),
        connectTimeoutMS: +(process.env.DB_CONNECT_TIMEOUT_IN_MS ?? 30000),
        analyticsConnectionString:
            process.env.DB_ANALYTICS_CONNECTION_STRING ?? '',
    },
    jwt: {
        secret: process.env.JWT_SECRET ?? '',
        expiresInSeconds: +(process.env.JWT_EXPIRES_IN_SECONDS ?? 86400), // 1 day
        refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET ?? '',
        refreshTokenExpiresInSeconds: +(
            process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS ?? 604800
        ), // 7 days
        forgotPasswordSecret: process.env.JWT_FORGOT_PASSWORD_SECRET || '',
        forgotPasswordExpiresInSeconds: +(
            process.env.JWT_FORGOT_PASSWORD_EXPIRES_IN_SECONDS || 3600
        ), // 1 hour,
    },
    /**
     * online error log service credentials
     */
    sentry: {
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: +(process.env.TRACES_SAMPLE_RATE || 1.0),
    },
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.example.com',
        port: +(process.env.SMTP_PORT || 587),
        emailSender: process.env.SMTP_EMAIL_SENDER || 'user@noreply.com',
        user: process.env.SMTP_USER || '',
        password: process.env.SMTP_PASSWORD || '',
    },
    redis: {
        host: process.env.REDIS_HOST || '',
        port: +(process.env.REDIS_PORT || 6379),
        password: process.env.REDIS_PASSWORD || '',
    },
    storage: {
        driver: process.env.STORAGE_DRIVER || 'local',
        rootPath: process.env.STORAGE_ROOT_PATH || 'storages',
        fileMaxSizeInBytes: +(
            process.env.STORAGE_FILE_MAX_SIZE_IN_BYTES || 10485760
        ), // 10 MB
        minio: {
            endpoint: process.env.STORAGE_MINIO_ENDPOINT || 'localhost',
            port: +(process.env.STORAGE_MINIO_PORT || 9000),
            accessKey: process.env.STORAGE_MINIO_ACCESS_KEY || '',
            secretKey: process.env.STORAGE_MINIO_SECRET_KEY || '',
            bucketName:
                process.env.STORAGE_MINIO_BUCKET_NAME || 'default-bucket',
            useSSL: process.env.STORAGE_MINIO_USE_SSL === 'true',
            region: process.env.STORAGE_MINIO_REGION || 'us-east-1',
            presignExpiresInSeconds: +(
                process.env.STORAGE_MINIO_URL_PRESIGN_EXPIRES_IN_SECONDS ||
                86400
            ), // 1 day
        },
        gcs: {
            projectId: process.env.STORAGE_GCS_PROJECT_ID || '',
            keyFilePath: process.env.STORAGE_GCS_KEY_FILE_PATH || '',
            bucketName: process.env.STORAGE_GCS_BUCKET_NAME || 'default-bucket',
            presignExpiresInSeconds: +(
                process.env.STORAGE_GCS_URL_PRESIGN_EXPIRES_IN_SECONDS || 86400
            ), // 1 day
        },
    },
    queue: {
        backoffDelayInSeconds: +(
            process.env.QUEUE_BACKOFF_DELAY_IN_SECONDS || 5
        ), // 5 seconds
        retryAttempts: +(process.env.QUEUE_RETRY_ATTEMPTS || 3), // 3 attempts
    },
    slack: {
        baseUrl: process.env.SLACK_BASE_URL || 'https://slack.com/api',
        webhookBaseUrl:
            process.env.SLACK_WEBHOOK_BASE_URL || 'https://hooks.slack.com',
        botOAuthToken: process.env.SLACK_BOT_OAUTH_TOKEN || '',
    },
    n8n: {
        baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
        apiKey: process.env.N8N_API_KEY || '',
    },
} as const;
