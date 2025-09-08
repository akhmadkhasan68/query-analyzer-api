import { StorageDriverEnum } from 'src/shared/enums/storage-driver.enum';
import { IBaseEntity } from './base-entity.interface';

export interface IStorageFile extends IBaseEntity {
    name: string;
    path: string;
    size: number;
    mimetype: string;
    driver: StorageDriverEnum;
}
