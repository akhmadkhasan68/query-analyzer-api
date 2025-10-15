import { IStorageFile } from 'src/infrastructures/databases/entities/interfaces/storage-file.interface';

/**
 * @file storage-driver-service.interface.ts
 * @description Defines the interface for storage driver services.
 * This interface outlines the methods required for file operations such as upload, move, delete, and
 * retrieving the URL of files in a storage system.
 * It is implemented by various storage driver services like LocalStorageService and MinioStorageService.
 */
export interface IStorageDriverService {
    /**
     * Uploads a file to the storage system.
     * @param file - The file to be uploaded.
     * @returns A promise that resolves to the metadata of the uploaded file.
     */
    uploadFile(file: Express.Multer.File): Promise<IStorageFile>;

    /**
     * Deletes a file from the storage system.
     * @param filePath - The path of the file to be deleted.
     * @returns A promise that resolves when the file is successfully deleted.
     */
    deleteFile(filePath: string): Promise<void>;

    /**
     * Retrieves the URL of a file in the storage system.
     * @param filePath - The path of the file.
     * @returns A promise that resolves to the URL of the file.
     */
    getFileUrl(filePath: string, contentType?: string): Promise<string>;

    /**
     * Retrieves the file as a buffer from the storage system.
     * @param filePath - The path of the file.
     * @returns A promise that resolves to the file buffer.
     * @throws Error if the file cannot be retrieved.
     */
    getFileBuffer(filePath: string): Promise<Buffer>;
}
