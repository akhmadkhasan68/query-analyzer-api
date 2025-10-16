import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IProjectSlackChannel } from 'src/infrastructures/databases/entities/interfaces/project-slack-channel.interface';
import { ProjectSlackChannel } from 'src/infrastructures/databases/entities/project-slack-channel.entity';
import { In, QueryRunner, Repository } from 'typeorm';

@Injectable()
export class ProjectSlackChannelV1Repository extends Repository<ProjectSlackChannel> {
    constructor(
        @InjectRepository(ProjectSlackChannel)
        private readonly repo: Repository<IProjectSlackChannel>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async findByProjectIds(
        projectIds: string[],
    ): Promise<IProjectSlackChannel[]> {
        return this.find({
            where: {
                projectId: In(projectIds),
            },
        });
    }

    async saveWithTransaction(
        queryRunner: QueryRunner,
        entity: IProjectSlackChannel,
    ): Promise<IProjectSlackChannel> {
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
