import { Injectable } from '@nestjs/common';
import { config } from 'src/config';
import { IStorageFile } from 'src/infrastructures/databases/entities/interfaces/storage-file.interface';
import { StorageFactoryService } from 'src/infrastructures/modules/storage/services/storage-factory.service';
import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { FileUtil } from 'src/shared/utils/file.util';
import { StorageFileV1Repository } from '../repositories/storage-file-v1.repository';

@Injectable()
export class StorageFileV1Service {
    constructor(
        public readonly storageFactoryService: StorageFactoryService,
        private readonly storageFileV1Repository: StorageFileV1Repository,
    ) {}

    /**
     * Uploads a file using the storage service.
     * @param file - The file to upload.
     * @returns The URL of the uploaded file.
     */
    async uploadFile(file: Express.Multer.File): Promise<IStorageFile> {
        if (!FileUtil.isValidFileType(file.mimetype)) {
            throw new Error(ERROR_MESSAGE_CONSTANT.InvalidFileMimeType);
        }

        if (file.size > config.storage.fileMaxSizeInBytes) {
            throw new Error(ERROR_MESSAGE_CONSTANT.FileTooLarge);
        }

        try {
            const result = await this.storageFactoryService
                .getStorageDriverService()
                .uploadFile(file);

            // Save the file metadata to the database
            await this.storageFileV1Repository.save(result);

            return result;
        } catch (error) {
            throw new Error(ERROR_MESSAGE_CONSTANT.FileUpload);
        }
    }

    async getFile(id: string): Promise<IStorageFile> {
        const storagFile = await this.storageFileV1Repository.findOneOrFail({
            where: { id },
        });

        return storagFile;
    }

    /**
     * Deletes a file using the storage service.
     * @param id - The ID of the file to delete.
     */
    async deleteFile(id: string): Promise<void> {
        try {
            // Check if the file exists in the database
            const file = await this.storageFileV1Repository.findOneOrFail({
                where: { id },
            });

            await this.storageFactoryService
                .setStorageDriverService(file.driver)
                .deleteFile(file.path);
        } catch (error) {
            throw new Error(ERROR_MESSAGE_CONSTANT.FileDelete);
        }
    }
}
