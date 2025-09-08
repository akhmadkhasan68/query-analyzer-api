import { Column, Entity } from 'typeorm';
import { StorageDriverEnum } from '../../../shared/enums/storage-driver.enum';
import { BaseEntity } from './base.entity';
import { IStorageFile } from './interfaces/storage-file.interface';

@Entity('storage_file')
export class StorageFile extends BaseEntity implements IStorageFile {
    @Column({
        type: 'varchar',
        length: 255,
    })
    name: string;

    @Column({
        type: 'varchar',
        length: 255,
    })
    path: string;

    @Column({
        type: 'int',
    })
    size: number;

    @Column({
        type: 'varchar',
        length: 50,
    })
    mimetype: string;

    @Column({
        type: 'varchar',
        length: 50,
    })
    driver: StorageDriverEnum;
}
