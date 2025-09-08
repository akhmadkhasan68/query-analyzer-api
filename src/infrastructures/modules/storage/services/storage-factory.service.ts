import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { config } from 'src/config';
import { StorageDriverEnum } from '../../../../shared/enums/storage-driver.enum';
import { IStorageDriverService } from '../interfaces/storage-driver-service.interface';
import { StorageGcsService } from './storage-gcs.service';
import { StorageLocalService } from './storage-local.service';
import { StorageMinioService } from './storage-minio.service';

@Injectable()
export class StorageFactoryService implements OnModuleInit {
    /**
     * A static instance of the storage driver service.
     * This instance is created based on the storage driver specified in the configuration.
     * It allows for easy access to the storage service without needing to instantiate it multiple times.
     * @type {IStorageDriverService}
     */
    private storageDriverService: IStorageDriverService;

    onModuleInit() {
        this.storageDriverService = StorageFactoryService.createStorageService();
    }

    /**
     * Creates an instance of the storage service based on the specified driver.
     * @param driver - The storage driver to use (e.g., 'local', 'minio', 'gcs').
     * @returns An instance of the storage service.
     */
    private static createStorageService(): IStorageDriverService {
        const storageDriver = config.storage.driver as StorageDriverEnum;

        switch (storageDriver) {
            case StorageDriverEnum.LOCAL: {
                return new StorageLocalService(
                    new Logger(StorageLocalService.name),
                );
            }
            case StorageDriverEnum.MINIO: {
                return new StorageMinioService(
                    new Logger(StorageMinioService.name),
                );
            }
            case StorageDriverEnum.GCS: {
                return new StorageGcsService(
                    new Logger(StorageGcsService.name),
                );
            }
            default: {
                throw new Error(`Unsupported storage driver: ${storageDriver}`);
            }
        }
    }

    /**
     * Gets the storage driver service instance.
     * @returns The storage driver service instance.
     */
    getStorageDriverService(): IStorageDriverService {
        return this.storageDriverService;
    }

    setStorageDriverService(driver: StorageDriverEnum): IStorageDriverService {
        switch (driver) {
            case StorageDriverEnum.LOCAL: {
                return new StorageLocalService(
                    new Logger(StorageLocalService.name),
                );
            }
            case StorageDriverEnum.MINIO: {
                return new StorageMinioService(
                    new Logger(StorageMinioService.name),
                );
            }
            case StorageDriverEnum.GCS: {
                return new StorageGcsService(
                    new Logger(StorageGcsService.name),
                );
            }
            default: {
                throw new Error(`Unsupported storage driver: ${driver}`);
            }
        }
    }
}
