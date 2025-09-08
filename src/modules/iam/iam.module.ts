import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'src/config';
import { Role } from 'src/infrastructures/databases/entities/role.entity';
import { ExportDataModule } from 'src/infrastructures/modules/export-data/export-data.module';
import { ImportDataModule } from 'src/infrastructures/modules/import-data/import-data.module';
import { MailModule } from 'src/infrastructures/modules/mail/mail.module';
import { QueueModule } from 'src/infrastructures/modules/queue/queue.module';
import { PermissionModule } from '../permission/permission.module';
import { RoleModule } from '../role/role.module';
import { UserModule } from '../user/user.module';
import { IamAuthV1Controller } from './controllers/iam-auth-v1.controller';
import { IamForgotPasswordV1Controller } from './controllers/iam-forgot-password-v1.controller';
import { IamAuthV1Service } from './services/iam-auth-v1.service';
import { IamForgotPasswordV1Service } from './services/iam-forgot-password-v1.service';
import { JwtRefreshStrategy } from './shared/strategy/jwt-refresh.strategy';
import { JwtStrategy } from './shared/strategy/jwt.strategy';

@Module({
    imports: [
        TypeOrmModule.forFeature([Role]),
        PassportModule,
        JwtModule.register({
            secret: config.jwt.secret,
            signOptions: { expiresIn: config.jwt.expiresInSeconds },
        }),
        MailModule,
        QueueModule,
        ImportDataModule,
        ExportDataModule,
        UserModule,
        RoleModule,
        PermissionModule,
    ],
    controllers: [IamAuthV1Controller, IamForgotPasswordV1Controller],
    providers: [
        // Auth
        IamAuthV1Service,
        IamForgotPasswordV1Service,

        JwtStrategy,
        JwtRefreshStrategy,
    ],
})
export class IamModule {}
