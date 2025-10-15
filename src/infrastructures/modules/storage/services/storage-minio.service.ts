import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as minio from 'minio';
import { config } from 'src/config';
import { IStorageFile } from 'src/infrastructures/databases/entities/interfaces/storage-file.interface';
import { StorageDriverEnum } from 'src/shared/enums/storage-driver.enum';
import { FileUtil } from 'src/shared/utils/file.util';
import { IStorageDriverService } from '../interfaces/storage-driver-service.interface';

/**
 * @description
 * StorageMinioService is a service for handling file storage operations using MinIO and S3-compatible object storage.
 * It implements the IStorageDriverService interface, providing methods to upload, delete, and retrieve files.
 * This service is designed to work with MinIO, which is an open-source object storage server that is compatible with Amazon S3 APIs.
 */
export class StorageMinioService implements IStorageDriverService {
    private minioClient: minio.Client;

    private readonly logger: Logger;

    constructor(logger: Logger) {
        this.minioClient = new minio.Client({
            endPoint: config.storage.minio.endpoint,
            port: config.storage.minio.port,
            useSSL: config.storage.minio.useSSL,
            accessKey: config.storage.minio.accessKey,
            secretKey: config.storage.minio.secretKey,
            region: config.storage.minio.region,
        });

        this.logger = logger;
    }

    async uploadFile(file: Express.Multer.File): Promise<IStorageFile> {
        const bucketName = config.storage.minio.bucketName;
        const rootPath = config.storage.rootPath;
        const fileName = FileUtil.generateUniqueFilename(file.originalname);
        const filePath = `${rootPath}/${fileName}`;

        try {
            // Ensure the bucket exists
            const bucketExists =
                await this.minioClient.bucketExists(bucketName);
            if (!bucketExists) {
                await this.minioClient.makeBucket(
                    bucketName,
                    config.storage.minio.region,
                );
            }

            // Upload the file to Minio
            await this.minioClient.putObject(
                bucketName,
                filePath,
                file.buffer,
                file.size,
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Content-Type': file.mimetype,
                },
            );

            this.logger.log(`File uploaded successfully to Minio: ${filePath}`);

            return {
                id: randomUUID(),
                name: fileName,
                path: filePath,
                size: file.size,
                mimetype: file.mimetype,
                driver: StorageDriverEnum.MINIO,
            };
        } catch (error) {
            const errorMessage = `Error uploading file to Minio: ${error.message}`;

            this.logger.error(errorMessage);

            throw new Error(errorMessage);
        }
    }

    async deleteFile(filePath: string): Promise<void> {
        try {
            const bucketName = config.storage.minio.bucketName;

            // Check if the bucket exists
            const bucketExists =
                await this.minioClient.bucketExists(bucketName);
            if (!bucketExists) {
                this.logger.warn(
                    `Bucket ${bucketName} does not exist. Cannot delete file.`,
                );
                return;
            }

            // Delete the file from Minio
            await this.minioClient.removeObject(bucketName, filePath, {
                forceDelete: true,
            });

            // Log the successful deletion
            this.logger.log(
                `File deleted successfully from Minio: ${filePath}`,
            );
        } catch (error) {
            const errorMessage = `Error deleting file from Minio: ${error.message}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    async getFileUrl(filePath: string, contentType?: string): Promise<string> {
        try {
            const bucketName = config.storage.minio.bucketName;

            // Check if the bucket exists
            const bucketExists =
                await this.minioClient.bucketExists(bucketName);
            if (!bucketExists) {
                this.logger.warn(
                    `Bucket ${bucketName} does not exist. Cannot get file URL.`,
                );
                throw new Error(`Bucket ${bucketName} does not exist.`);
            }

            const isDirectDownload = true; // TODO: make this configurable
            let reqParams = {};
            if (isDirectDownload) {
                reqParams = {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'response-content-disposition': `attachment; filename="${filePath}"`,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'response-content-type':
                        contentType || 'application/octet-stream',
                };
            } else {
                reqParams = {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'response-content-type':
                        contentType || 'application/octet-stream',
                };
            }

            // Generate a presigned URL for the file
            const url = await this.minioClient.presignedUrl(
                'GET',
                bucketName,
                filePath,
                config.storage.minio.presignExpiresInSeconds,
                reqParams,
            );

            return url;
        } catch (error) {
            const errorMessage = `Error getting file URL from Minio: ${error.message}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    async getFileBuffer(filePath: string): Promise<Buffer> {
        try {
            const bucketName = config.storage.minio.bucketName;

            // Check if the bucket exists
            const bucketExists =
                await this.minioClient.bucketExists(bucketName);
            if (!bucketExists) {
                this.logger.warn(
                    `Bucket ${bucketName} does not exist. Cannot get file buffer.`,
                );
                throw new Error(`Bucket ${bucketName} does not exist.`);
            }

            // Get the file stream from Minio
            const stream = await this.minioClient.getObject(
                bucketName,
                filePath,
            );

            return new Promise<Buffer>((resolve, reject) => {
                const chunks: Buffer[] = [];
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', (err) => {
                    const errorMessage = `Error retrieving file buffer from Minio: ${err.message}`;
                    this.logger.error(errorMessage);
                    reject(new Error(errorMessage));
                });
            });
        } catch (error) {
            const errorMessage = `Error getting file buffer from Minio: ${error.message}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
}
