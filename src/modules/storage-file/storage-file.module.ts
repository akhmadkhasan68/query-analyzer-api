import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageFile } from 'src/infrastructures/databases/entities/storage-file.entity';
import { StorageModule } from 'src/infrastructures/modules/storage/storage.module';
import { StorageFileV1Controller } from './controllers/storage-file-v1.controller';
import { StorageFileV1Repository } from './repositories/storage-file-v1.repository';
import { StorageFileV1Service } from './services/storage-file-v1.service';

@Module({
    imports: [StorageModule, TypeOrmModule.forFeature([StorageFile])],
    controllers: [StorageFileV1Controller],
    providers: [StorageFileV1Service, StorageFileV1Repository],
    exports: [StorageFileV1Repository, StorageFileV1Service],
})
export class StorageFileModule {}
