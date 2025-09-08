import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { IProjectKey } from 'src/infrastructures/databases/entities/interfaces/project-key.interface';
import { IProject } from 'src/infrastructures/databases/entities/interfaces/project.interface';
import { PlatformV1Repository } from 'src/modules/platform/repositories/platform-v1.repository';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { DataSource } from 'typeorm';
import { ProjectCreateV1Request } from '../dtos/requests/project-create-v1.request';
import { ProjectPaginateV1Request } from '../dtos/requests/project-paginate-v1.request';
import { ProjectKeyV1Repository } from '../repositories/project-key-v1.repository';
import { ProjectV1Repository } from '../repositories/project-v1.repository';
import { ProjectKeyV1Service } from './project-key-v1.service';

@Injectable()
export class ProjectV1Service {
    constructor(
        private readonly projectV1Repository: ProjectV1Repository,
        private readonly projectKeyV1Repository: ProjectKeyV1Repository,
        private readonly platformV1Repository: PlatformV1Repository,

        private readonly projectKeyV1Service: ProjectKeyV1Service,

        private readonly dataSource: DataSource,
    ) {}

    private async validateProjectName(name: string): Promise<void> {
        const existingProject =
            await this.projectV1Repository.isExistByName(name);

        if (existingProject) {
            throw new UnprocessableEntityException(
                `Project with name '${name}' already exists`,
            );
        }
    }

    private async validateAndGetPlatform(platformId: string) {
        return await this.platformV1Repository.findOneByIdOrFail(platformId);
    }

    private async createProjectWithTransaction(
        project: IProject,
        projectKey: IProjectKey,
    ): Promise<IProject> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const createdProject =
                await this.projectV1Repository.saveWithTransaction(
                    queryRunner,
                    project,
                );

            const createdProjectKey =
                await this.projectKeyV1Repository.saveWithTransaction(
                    queryRunner,
                    {
                        ...projectKey,
                        project: createdProject,
                    },
                );

            createdProject.projectKeys = [createdProjectKey];

            await queryRunner.commitTransaction();

            if (
                createdProject.projectKeys &&
                createdProject.projectKeys.length > 0
            ) {
                (createdProject.projectKeys[0] as any).plainKey = (
                    projectKey as any
                ).plainKey;
            }

            return createdProject;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async create(dto: ProjectCreateV1Request): Promise<IProject> {
        await this.validateProjectName(dto.name);
        const platform = await this.validateAndGetPlatform(dto.platformId);

        const project = this.projectV1Repository.create({
            platform,
            name: dto.name,
            description: dto.description,
            status: dto.status,
        });

        const projectKey =
            await this.projectKeyV1Service.createProjectDefaultKey();

        return this.createProjectWithTransaction(project, projectKey);
    }

    async paginate(
        paginationDto: ProjectPaginateV1Request,
    ): Promise<IPaginateData<IProject>> {
        return await this.projectV1Repository.paginate(paginationDto);
    }
}
