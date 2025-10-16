import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IProjectGitlab } from 'src/infrastructures/databases/entities/interfaces/project-gitlab.interface';
import { ProjectGitlab } from 'src/infrastructures/databases/entities/project-gitlab.entity';
import { In, QueryRunner, Repository } from 'typeorm';

@Injectable()
export class ProjectGitlabV1Repository extends Repository<ProjectGitlab> {
    constructor(
        @InjectRepository(ProjectGitlab)
        private readonly repo: Repository<IProjectGitlab>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async findOneOrFailByProjectId(projectId: string): Promise<IProjectGitlab> {
        return await this.repo.findOneOrFail({
            where: { projectId: projectId },
        });
    }

    async saveWithTransaction(
        queryRunner: QueryRunner,
        entity: IProjectGitlab,
    ): Promise<IProjectGitlab> {
        return queryRunner.manager.getRepository(this.repo.target).save(entity);
    }

    async deleteByProjectIdsWithTransaction(
        queryRunner: QueryRunner,
        projectIds: string[],
    ): Promise<void> {
        await queryRunner.manager.getRepository(this.repo.target).delete({
            projectId: In(projectIds),
        });
    }
}
