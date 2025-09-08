import { Module } from '@nestjs/common';
import { ExportDataFactoryService } from './services/export-data-factory.service';

@Module({
    imports: [],
    providers: [ExportDataFactoryService],
    exports: [ExportDataFactoryService],
})
export class ExportDataModule {}
