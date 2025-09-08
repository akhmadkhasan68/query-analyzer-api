import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectKey } from 'src/infrastructures/databases/entities/project-key.entity';
import { Project } from 'src/infrastructures/databases/entities/project.entity';
import { PlatformModule } from '../platform/platform.module';
import { ProjectV1Controller } from './controllers/project-v1.controller';
import { ProjectKeyV1Repository } from './repositories/project-key-v1.repository';
import { ProjectV1Repository } from './repositories/project-v1.repository';
import { ProjectKeyV1Service } from './services/project-key-v1.service';
import { ProjectV1Service } from './services/project-v1.service';

@Module({
    imports: [TypeOrmModule.forFeature([Project, ProjectKey]), PlatformModule],
    controllers: [ProjectV1Controller],
    providers: [
        // Services
        ProjectV1Service,
        ProjectKeyV1Service,

        // Repositories
        ProjectV1Repository,
        ProjectKeyV1Repository,
    ],
    exports: [],
})
export class ProjectModule {}
