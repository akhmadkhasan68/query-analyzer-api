import {
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { IProjectGitlab } from 'src/infrastructures/databases/entities/interfaces/project-gitlab.interface';
import { IProjectKey } from 'src/infrastructures/databases/entities/interfaces/project-key.interface';
import { IProjectSlackChannel } from 'src/infrastructures/databases/entities/interfaces/project-slack-channel.interface';
import { IProject } from 'src/infrastructures/databases/entities/interfaces/project.interface';
import { PlatformV1Repository } from 'src/modules/platform/repositories/platform-v1.repository';
import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { DataSource } from 'typeorm';
import {
    ProjectCreateV1Request,
    ProjectUpdateV1Request,
} from '../dtos/requests/project-create-v1.request';
import { ProjectPaginateV1Request } from '../dtos/requests/project-paginate-v1.request';
import { ProjectGitlabV1Repository } from '../repositories/project-gitlab-v1.repository';
import { ProjectKeyV1Repository } from '../repositories/project-key-v1.repository';
import { ProjectSlackChannelV1Repository } from '../repositories/project-slack-channel-v1.repository';
import { ProjectV1Repository } from '../repositories/project-v1.repository';
import { ProjectKeyV1Service } from './project-key-v1.service';

@Injectable()
export class ProjectV1Service {
    constructor(
        private readonly projectV1Repository: ProjectV1Repository,
        private readonly projectKeyV1Repository: ProjectKeyV1Repository,
        private readonly projectGitlabV1Repository: ProjectGitlabV1Repository,
        private readonly platformV1Repository: PlatformV1Repository,
        private readonly projectKeyV1Service: ProjectKeyV1Service,
        private readonly projectSlackChannelV1Repository: ProjectSlackChannelV1Repository,

        private readonly dataSource: DataSource,
    ) {}

    async paginate(
        paginationDto: ProjectPaginateV1Request,
    ): Promise<IPaginateData<IProject>> {
        return await this.projectV1Repository.paginate(paginationDto);
    }

    async detail(id: string): Promise<IProject> {
        const project = await this.projectV1Repository.findOneByIdWithRelations(
            id,
            ['platform', 'projectKeys'],
        );

        if (!project) {
            throw new NotFoundException(ERROR_MESSAGE_CONSTANT.NotFound);
        }

        return project;
    }

    async create(dto: ProjectCreateV1Request): Promise<IProject> {
        await this.validateProjectName(dto.name);
        const platform = await this.validateAndGetPlatform(dto.platformId);

        // Create project entity
        const project = this.projectV1Repository.create({
            platform,
            name: dto.name,
            description: dto.description,
            status: dto.status,
        });

        // Create default project key
        const projectKey =
            await this.projectKeyV1Service.createProjectDefaultKey();

        // Create gitlab project entity if gitlabProjectId is provided
        let projectGitlab: IProjectGitlab | undefined;
        if (dto.gitlab) {
            projectGitlab = this.projectGitlabV1Repository.create({
                gitlabProjectId: dto.gitlab.projectId,
                gitlabUrl: dto.gitlab.url,
                gitlabGroupId: dto.gitlab.groupId,
                gitlabGroupName: dto.gitlab.groupName,
                gitlabDefaultBranch: dto.gitlab.defaultBranch,
                gitlabVisibility: dto.gitlab.visibility,
            });
        }

        // Create slack channel entity if slackChannelId is provided
        let projectSlackChannel: IProjectSlackChannel | undefined;
        if (dto.slackChannel) {
            projectSlackChannel = this.projectSlackChannelV1Repository.create({
                slackChannelId: dto.slackChannel.slackChannelId,
            });
        }

        return this.createProjectWithTransaction(
            project,
            projectKey,
            projectGitlab,
            projectSlackChannel,
        );
    }

    async update(id: string, dto: ProjectUpdateV1Request): Promise<void> {
        await this.validateProjectName(dto.name);

        const platform = await this.validateAndGetPlatform(dto.platformId);

        const project = await this.projectV1Repository.findOneById(id);

        if (!project) {
            throw new NotFoundException(ERROR_MESSAGE_CONSTANT.NotFound);
        }

        await this.projectV1Repository.update(project.id, {
            platform,
            name: dto.name,
            description: dto.description,
            status: dto.status,
        });

        // Note: Gitlab info is not updated for now
    }

    async deleteByIds(ids: string[]): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        for (let i = 0; i < ids.length; i++) {
            const project = await this.projectV1Repository.findOneById(ids[i]);

            if (!project) {
                throw new NotFoundException(ERROR_MESSAGE_CONSTANT.NotFound);
            }
        }

        try {
            // Delete related project keys, gitlab info, slack channel first
            await this.projectGitlabV1Repository.deleteByProjectIdsWithTransaction(
                queryRunner,
                ids,
            );

            await this.projectSlackChannelV1Repository.deleteByProjectIdsWithTransaction(
                queryRunner,
                ids,
            );

            await this.projectKeyV1Repository.deleteByProjectIdsWithTransaction(
                queryRunner,
                ids,
            );

            await this.projectV1Repository.deleteByIdsWithTransaction(
                queryRunner,
                ids,
            );

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

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
        projectGitlab?: IProjectGitlab,
        projectSlackChannel?: IProjectSlackChannel,
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

            if (projectGitlab) {
                projectGitlab.projectId = createdProject.id;
                await this.projectGitlabV1Repository.saveWithTransaction(
                    queryRunner,
                    projectGitlab,
                );
            }

            if (projectSlackChannel) {
                projectSlackChannel.projectId = createdProject.id;
                await this.projectSlackChannelV1Repository.saveWithTransaction(
                    queryRunner,
                    projectSlackChannel,
                );
            }

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
}
