import { Module } from '@nestjs/common';
import { StorageFactoryService } from './services/storage-factory.service';

@Module({
    imports: [],
    providers: [StorageFactoryService],
    exports: [StorageFactoryService],
})
export class StorageModule {}
