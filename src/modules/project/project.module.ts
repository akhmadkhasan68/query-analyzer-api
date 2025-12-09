import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from 'src/infrastructures/databases/entities/platform.entity';
import { ProjectGitlab } from 'src/infrastructures/databases/entities/project-gitlab.entity';
import { ProjectKey } from 'src/infrastructures/databases/entities/project-key.entity';
import { ProjectSetting } from 'src/infrastructures/databases/entities/project-setting.entity';
import { ProjectSlackChannel } from 'src/infrastructures/databases/entities/project-slack-channel.entity';
import { Project } from 'src/infrastructures/databases/entities/project.entity';
import { PlatformV1Controller } from '../platform/controllers/platform-v1.controller';
import { PlatformModule } from '../platform/platform.module';
import { PlatformV1Repository } from '../platform/repositories/platform-v1.repository';
import { PlatformV1Service } from '../platform/services/platform-v1.service';
import { ProjectKeyV1Controller } from './controllers/project-key-v1.controller';
import { ProjectSettingV1Controller } from './controllers/project-setting-v1.controller';
import { ProjectSlackChannelV1Controller } from './controllers/project-slack-channel-v1.controller';
import { ProjectV1Controller } from './controllers/project-v1.controller';
import { ProjectGitlabV1Repository } from './repositories/project-gitlab-v1.repository';
import { ProjectKeyV1Repository } from './repositories/project-key-v1.repository';
import { ProjectSettingV1Repository } from './repositories/project-setting-v1.repository';
import { ProjectSlackChannelV1Repository } from './repositories/project-slack-channel-v1.repository';
import { ProjectV1Repository } from './repositories/project-v1.repository';
import { ProjectKeyV1Service } from './services/project-key-v1.service';
import { ProjectSettingV1Service } from './services/project-setting-v1.service';
import { ProjectSlackChannelV1Service } from './services/project-slack-channel-v1.service';
import { ProjectV1Service } from './services/project-v1.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Project,
            ProjectKey,
            Platform,
            ProjectGitlab,
            ProjectSlackChannel,
            ProjectSetting,
        ]),
        PlatformModule,
    ],
    controllers: [
        ProjectV1Controller,
        ProjectKeyV1Controller,
        PlatformV1Controller,
        ProjectSlackChannelV1Controller,
        ProjectSettingV1Controller,
    ],
    providers: [
        // Services
        ProjectV1Service,
        ProjectKeyV1Service,
        PlatformV1Service,
        ProjectSlackChannelV1Service,
        ProjectSettingV1Service,

        // Repositories
        ProjectV1Repository,
        ProjectKeyV1Repository,
        PlatformV1Repository,
        ProjectGitlabV1Repository,
        ProjectSlackChannelV1Repository,
        ProjectSettingV1Repository,
    ],
    exports: [
        ProjectV1Service,
        ProjectKeyV1Service,
        PlatformV1Service,
        ProjectSlackChannelV1Service,
        ProjectSettingV1Service,

        ProjectV1Repository,
        ProjectKeyV1Repository,
        PlatformV1Repository,
        ProjectGitlabV1Repository,
        ProjectSlackChannelV1Repository,
        ProjectSettingV1Repository,
    ],
})
export class ProjectModule {}
