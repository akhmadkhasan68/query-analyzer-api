import { Module } from '@nestjs/common';
import { ImportDataFactoryService } from './services/import-data-factory.service';

@Module({
    imports: [],
    providers: [ImportDataFactoryService],
    exports: [ImportDataFactoryService],
})
export class ImportDataModule {}
