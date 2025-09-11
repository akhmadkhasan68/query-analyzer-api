import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IProjectKey } from 'src/infrastructures/databases/entities/interfaces/project-key.interface';
import { ProjectKey } from 'src/infrastructures/databases/entities/project-key.entity';
import { HashUtil } from 'src/shared/utils/hash.util';
import { IsNull, Not, QueryRunner, Repository } from 'typeorm';
import { IPaginateData } from '../../../shared/interfaces/paginate-response.interface';
import { PaginationUtil } from '../../../shared/utils/pagination.util';
import { TypeORMQueryFilterUtil } from '../../../shared/utils/typeorm-query-filter.util';
import { TypeORMQuerySortingUtil } from '../../../shared/utils/typeorm-query-sort.util';
import { ProjectKeyPaginateV1Request } from '../dtos/requests/project-key-paginate-v1.request';

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

    async paginate(
        projectId: string,
        request: ProjectKeyPaginateV1Request,
    ): Promise<IPaginateData<IProjectKey>> {
        const alias = this.metadata.name;
        const ALLOWED_SORTS = new Map<string, string>([
            ['name', `${alias}.name`],
            ['updated_at', `${alias}.updatedAt`],
            ['created_at', `${alias}.createdAt`],
        ]);

        const query = this.createQueryBuilder(alias).leftJoinAndSelect(
            `${alias}.project`,
            'project',
        );

        // Validate the sort value in the request
        TypeORMQueryFilterUtil.validateSortValueDto(request, ALLOWED_SORTS);

        TypeORMQueryFilterUtil.applyFilters(query, {
            search: request.search
                ? {
                      term: request.search,
                      fields: [{ name: `${alias}.name`, type: 'string' }],
                  }
                : null,
        });

        // Handle sort
        TypeORMQuerySortingUtil.applySorting(query, {
            sort: request.sort,
            order: request.order,
            allowedSorts: ALLOWED_SORTS,
        });

        // Handle pagination
        query.take(request.perPage);
        query.skip(PaginationUtil.countOffset(request));
        query.where({
            project: { id: projectId },
        });

        const [items, count] = await query.getManyAndCount();

        const meta = PaginationUtil.mapMeta(count, request);

        return {
            meta,
            items,
        };
    }
}
