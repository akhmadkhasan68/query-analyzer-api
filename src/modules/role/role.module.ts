import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/infrastructures/databases/entities/role.entity';
import { ExportDataModule } from 'src/infrastructures/modules/export-data/export-data.module';
import { ImportDataModule } from 'src/infrastructures/modules/import-data/import-data.module';
import { PermissionModule } from '../permission/permission.module';
import { RoleExportV1Controller } from './controllers/role-export-v1.controller';
import { RolePermissionV1Controller } from './controllers/role-permission-v1.controller';
import { RoleV1Controller } from './controllers/role-v1.controller';
import { RoleV1Repository } from './repositories/role-v1.repository';
import { RoleV1Service } from './services/role-v1.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Role]),
        ImportDataModule,
        ExportDataModule,
        PermissionModule,
    ],
    controllers: [
        RoleV1Controller,
        RoleExportV1Controller,
        RolePermissionV1Controller,
    ],
    providers: [RoleV1Service, RoleV1Repository],
    exports: [RoleV1Service, RoleV1Repository],
})
export class RoleModule {}
