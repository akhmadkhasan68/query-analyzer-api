import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserToken } from 'src/infrastructures/databases/entities/user-token.entity';
import { User } from 'src/infrastructures/databases/entities/user.entity';
import { ExportDataModule } from 'src/infrastructures/modules/export-data/export-data.module';
import { ImportDataModule } from 'src/infrastructures/modules/import-data/import-data.module';
import { RoleModule } from '../role/role.module';
import { UserExportV1Controller } from './controllers/user-export-v1.controller';
import { UserImportV1Controller } from './controllers/user-import-v1.controller';
import { UserV1Controller } from './controllers/user-v1.controller';
import { UserTokenV1Repository } from './repositories/user-token-v1.repository';
import { UserV1Repository } from './repositories/user-v1.repository';
import { UserV1Service } from './services/user-v1.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, UserToken]),
        RoleModule,
        ImportDataModule,
        ExportDataModule,
    ],
    controllers: [
        UserV1Controller,
        UserExportV1Controller,
        UserImportV1Controller,
    ],
    providers: [
        // Repositories
        UserV1Repository,
        UserTokenV1Repository,

        // Services
        UserV1Service,
    ],
    exports: [
        // Repositories
        UserV1Repository,
        UserTokenV1Repository,

        // Services
        UserV1Service,
    ],
})
export class UserModule {}
