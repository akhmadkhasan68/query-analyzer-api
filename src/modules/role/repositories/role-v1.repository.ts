import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IRole } from 'src/infrastructures/databases/entities/interfaces/role.interface';
import { Role } from 'src/infrastructures/databases/entities/role.entity';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { QueryFilterUtil } from 'src/shared/utils/query-filter.util';
import { QuerySortingUtil } from 'src/shared/utils/query-sort.util';
import { Repository } from 'typeorm';
import { RolePaginateV1Request } from '../dtos/requests/role-paginate-v1.request';

@Injectable()
export class RoleV1Repository extends Repository<IRole> {
    constructor(
        @InjectRepository(Role)
        private readonly repo: Repository<IRole>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    private readonly defaultRelations: string[] = [
        'permissions',
        'permissions.operation',
        'permissions.resource',
    ];

    async pagination(
        request: RolePaginateV1Request,
    ): Promise<IPaginateData<IRole>> {
        const alias = this.metadata.name;

        const ALLOWED_SORTS = new Map<string, string>([
            ['name', `${alias}.name`],
            ['updated_at', `${alias}.updatedAt`],
            ['created_at', `${alias}.createdAt`],
        ]);

        const query = this.createQueryBuilder(
            this.metadata.name,
        ).leftJoinAndSelect(`${alias}.permissions`, 'permissions');

        // Validate the sort value in the request
        QueryFilterUtil.validateSortValueDto(request, ALLOWED_SORTS);

        QueryFilterUtil.applyFilters(query, {
            search: request.search
                ? {
                      term: request.search,
                      fields: [
                          { name: `${alias}.name`, type: 'string' },
                          { name: `${alias}.slug`, type: 'string' },
                      ],
                  }
                : null,
            filters: [
                {
                    field: `${alias}.slug`,
                    value: request.slug,
                },
            ],
        });

        // Handle sort
        QuerySortingUtil.applySorting(query, {
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
            items,
            meta,
        };
    }

    async findOneByIdOrFail(id: string): Promise<IRole> {
        return await this.findOneOrFail({
            where: { id },
        });
    }

    async findOneByIdOrFailWithRelations(
        id: string,
        relations?: string[],
    ): Promise<IRole> {
        return await this.findOneOrFail({
            where: { id },
            relations: relations || this.defaultRelations,
        });
    }
}
