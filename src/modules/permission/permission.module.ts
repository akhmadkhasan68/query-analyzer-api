import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/infrastructures/databases/entities/permission.entity';
import { ExportDataModule } from 'src/infrastructures/modules/export-data/export-data.module';
import { ImportDataModule } from 'src/infrastructures/modules/import-data/import-data.module';
import { PermissionExportV1Controller } from './controllers/permission-export-v1.controller';
import { PermissionV1Controller } from './controllers/permission-v1.controller';
import { PermissionV1Repository } from './repositories/permission-v1.repository';
import { PermissionV1Service } from './services/permission-v1.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Permission]),
        ImportDataModule,
        ExportDataModule,
    ],
    controllers: [PermissionV1Controller, PermissionExportV1Controller],
    providers: [
        // Repositories
        PermissionV1Repository,

        // Services
        PermissionV1Service,
    ],
    exports: [
        // Repositories
        PermissionV1Repository,

        // Services
        PermissionV1Service,
    ],
})
export class PermissionModule {}
