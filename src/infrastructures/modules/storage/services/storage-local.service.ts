import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'src/config';
import { IStorageFile } from 'src/infrastructures/databases/entities/interfaces/storage-file.interface';
import { StorageDriverEnum } from 'src/shared/enums/storage-driver.enum';
import { FileUtil } from 'src/shared/utils/file.util';
import { IStorageDriverService } from '../interfaces/storage-driver-service.interface';

/**
 * @description
 * StorageLocalService is a service for handling file storage operations on the local filesystem.
 * It implements the IStorageDriverService interface, providing methods to upload, delete, and retrieve
 * files stored locally.
 * This service is designed to work with the local file system, allowing for easy file management
 * without the need for external storage services.
 * It supports file uploads, deletions, and URL generation for accessing files.
 */
export class StorageLocalService implements IStorageDriverService {
    private readonly logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    async uploadFile(file: Express.Multer.File): Promise<IStorageFile> {
        try {
            const rootPath = config.storage.rootPath;
            const fileName = FileUtil.generateUniqueFilename(file.originalname);
            const filePath = `${rootPath}/${fileName}`;

            // Ensure the directory exists
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {
                    recursive: true,
                });
            }

            // Write the file to the local filesystem
            fs.writeFileSync(filePath, file.buffer);

            this.logger.log(
                `File uploaded successfully to local storage: ${filePath}`,
            );

            return {
                id: randomUUID(),
                name: fileName,
                path: filePath,
                size: file.size,
                mimetype: file.mimetype,
                driver: StorageDriverEnum.LOCAL,
            };
        } catch (error) {
            const errorMessage = `Error uploading file: ${error.message}`;
            this.logger.error(errorMessage);

            throw new Error(errorMessage);
        }
    }

    async deleteFile(filePath: string): Promise<void> {
        try {
            const fullPath = path.resolve(filePath);

            // Check if the file exists
            if (!fs.existsSync(fullPath)) {
                this.logger.warn(`File not found: ${fullPath}`);
                throw new Error(`File not found: ${fullPath}`);
            }

            // Delete the file
            fs.unlinkSync(fullPath);

            this.logger.log(`File deleted successfully: ${fullPath}`);
        } catch (error) {
            const errorMessage = `Error deleting file: ${error.message}`;
            this.logger.error(errorMessage);

            throw new Error(errorMessage);
        }
    }

    async getFileUrl(filePath: string): Promise<string> {
        try {
            // For local storage, the URL is the file path
            const fullPath = path.resolve(filePath);
            if (!fs.existsSync(fullPath)) {
                this.logger.warn(`File not found for URL: ${fullPath}`);
                throw new Error(`File not found: ${fullPath}`);
            }

            // Return the file URL (for local storage, this could be a file system path)
            return `http://127.0.0.1:3000/${filePath}`;
        } catch (error) {
            const errorMessage = `Error getting file URL: ${error.message}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    async getFileBuffer(filePath: string): Promise<Buffer> {
        try {
            const fullPath = path.resolve(filePath);
            if (!fs.existsSync(fullPath)) {
                this.logger.warn(`File not found: ${fullPath}`);
                throw new Error(`File not found: ${fullPath}`);
            }

            return fs.readFileSync(fullPath);
        } catch (error) {
            const errorMessage = `Error retrieving file buffer: ${error.message}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
}
