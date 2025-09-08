import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IStorageFile } from 'src/infrastructures/databases/entities/interfaces/storage-file.interface';
import { StorageFile } from 'src/infrastructures/databases/entities/storage-file.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StorageFileV1Repository extends Repository<IStorageFile> {
    constructor(
        @InjectRepository(StorageFile)
        private readonly repository: Repository<IStorageFile>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }
}
