import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IProjectKey } from 'src/infrastructures/databases/entities/interfaces/project-key.interface';
import { ProjectKey } from 'src/infrastructures/databases/entities/project-key.entity';
import { HashUtil } from 'src/shared/utils/hash.util';
import { IsNull, Not, QueryRunner, Repository } from 'typeorm';

@Injectable()
export class ProjectKeyV1Repository extends Repository<IProjectKey> {
    constructor(
        @InjectRepository(ProjectKey)
        private readonly repo: Repository<IProjectKey>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async findOneById(id: string): Promise<IProjectKey | null> {
        return this.repo.findOne({ where: { id } });
    }

    async findOneByIdOrFail(id: string): Promise<IProjectKey> {
        return this.repo.findOneOrFail({ where: { id } });
    }

    async saveWithTransaction(
        queryRunner: QueryRunner,
        entity: IProjectKey,
    ): Promise<IProjectKey> {
        return queryRunner.manager.getRepository(this.repo.target).save(entity);
    }

    async findOneByPlainKeyAndProjectId(
        plainKey: string,
        projectId: string,
    ): Promise<IProjectKey | null> {
        const projectKeys = await this.repo.find({
            where: {
                project: { id: projectId },
                hashedKey: Not(IsNull()),
            },
            relations: ['project', 'project.platform'],
        });

        for (const projectKey of projectKeys) {
            const isMatch = await HashUtil.compareHashBcrypt(
                plainKey,
                projectKey.hashedKey,
            );
            if (isMatch) {
                return projectKey;
            }
        }

        return null;
    }
}
