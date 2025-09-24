import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from 'src/infrastructures/databases/entities/platform.entity';
import { ProjectGitlab } from 'src/infrastructures/databases/entities/project-gitlab.entity';
import { ProjectKey } from 'src/infrastructures/databases/entities/project-key.entity';
import { Project } from 'src/infrastructures/databases/entities/project.entity';
import { PlatformV1Controller } from '../platform/controllers/platform-v1.controller';
import { PlatformModule } from '../platform/platform.module';
import { PlatformV1Repository } from '../platform/repositories/platform-v1.repository';
import { PlatformV1Service } from '../platform/services/platform-v1.service';
import { ProjectKeyV1Controller } from './controllers/project-key-v1.controller';
import { ProjectV1Controller } from './controllers/project-v1.controller';
import { ProjectGitlabV1Repository } from './repositories/project-gitlab-v1.repository';
import { ProjectKeyV1Repository } from './repositories/project-key-v1.repository';
import { ProjectV1Repository } from './repositories/project-v1.repository';
import { ProjectKeyV1Service } from './services/project-key-v1.service';
import { ProjectV1Service } from './services/project-v1.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Project,
            ProjectKey,
            Platform,
            ProjectGitlab,
        ]),
        PlatformModule,
    ],
    controllers: [
        ProjectV1Controller,
        ProjectKeyV1Controller,
        PlatformV1Controller,
    ],
    providers: [
        // Services
        ProjectV1Service,
        ProjectKeyV1Service,
        PlatformV1Service,

        // Repositories
        ProjectV1Repository,
        ProjectKeyV1Repository,
        PlatformV1Repository,
        ProjectGitlabV1Repository,
    ],
    exports: [
        ProjectV1Service,
        ProjectKeyV1Service,
        PlatformV1Service,

        ProjectV1Repository,
        ProjectKeyV1Repository,
        PlatformV1Repository,
        ProjectGitlabV1Repository,
    ],
})
export class ProjectModule {}
