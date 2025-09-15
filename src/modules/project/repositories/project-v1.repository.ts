import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IProject } from 'src/infrastructures/databases/entities/interfaces/project.interface';
import { Project } from 'src/infrastructures/databases/entities/project.entity';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { TypeORMQueryFilterUtil } from 'src/shared/utils/typeorm-query-filter.util';
import { TypeORMQuerySortingUtil } from 'src/shared/utils/typeorm-query-sort.util';
import { FindManyOptions, In, Not, QueryRunner, Repository } from 'typeorm';
import { ProjectPaginateV1Request } from '../dtos/requests/project-paginate-v1.request';

@Injectable()
export class ProjectV1Repository extends Repository<IProject> {
    constructor(
        @InjectRepository(Project)
        private readonly repo: Repository<IProject>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    private readonly defaultRelations: string[] = ['platform'];

    async paginate(
        request: ProjectPaginateV1Request,
    ): Promise<IPaginateData<IProject>> {
        const alias = this.metadata.name;
        const ALLOWED_SORTS = new Map<string, string>([
            ['name', `${alias}.name`],
            ['status', `${alias}.status`],
            ['updated_at', `${alias}.updatedAt`],
            ['created_at', `${alias}.createdAt`],
        ]);

        const query = this.createQueryBuilder(alias).leftJoinAndSelect(
            `${alias}.platform`,
            'platform',
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
            filters: [
                {
                    field: `${alias}.status`,
                    value: request.status,
                },
            ],
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

        const [items, count] = await query.getManyAndCount();

        const meta = PaginationUtil.mapMeta(count, request);

        return {
            meta,
            items,
        };
    }

    async findOneById(id: string): Promise<IProject | null> {
        return this.repo.findOne({ where: { id } });
    }

    async findOneByIdWithRelations(
        id: string,
        relations?: string[],
    ): Promise<IProject | null> {
        return this.repo.findOne({
            where: { id },
            relations: relations ?? this.defaultRelations,
        });
    }

    async findOneOrFailByIdWithRelations(
        id: string,
        relations?: string[],
    ): Promise<IProject> {
        return this.repo.findOneOrFail({
            where: { id },
            relations: relations ?? this.defaultRelations,
        });
    }

    async findOneByIdOrFail(id: string): Promise<IProject> {
        return this.repo.findOneOrFail({ where: { id } });
    }

    async isExistByName(name: string, ignoreId?: string): Promise<boolean> {
        let whereCondition: FindManyOptions = {
            where: {
                name: name,
            },
        };

        if (typeof ignoreId !== 'undefined') {
            whereCondition = {
                where: {
                    name: name,
                    id: Not(ignoreId),
                },
            };
        }

        return await this.repo.exists(whereCondition);
    }

    async saveWithTransaction(
        queryRunner: QueryRunner,
        entity: IProject,
    ): Promise<IProject> {
        return queryRunner.manager.getRepository(this.repo.target).save(entity);
    }

    async updateById(id: string, entity: IProject): Promise<void> {
        await this.repo.update(id, entity);
    }

    async deleteByIdsWithTransaction(
        queryRunner: QueryRunner,
        ids: string[],
    ): Promise<void> {
        await queryRunner.manager.getRepository(this.repo.target).delete({
            id: In(ids),
        });
    }
}
