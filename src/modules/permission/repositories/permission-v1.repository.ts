import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPermission } from 'src/infrastructures/databases/entities/interfaces/permission.interface';
import { Permission } from 'src/infrastructures/databases/entities/permission.entity';
import { RolePermissionPaginateV1Request } from 'src/modules/role/dtos/requests/role-permission-paginate-v1.request';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { QueryFilterUtil } from 'src/shared/utils/query-filter.util';
import { QuerySortingUtil } from 'src/shared/utils/query-sort.util';
import { Repository } from 'typeorm';
import { PermissionPaginateV1Request } from '../dtos/requests/permission-paginate-v1.request';

@Injectable()
export class PermissionV1Repository extends Repository<IPermission> {
    constructor(
        @InjectRepository(Permission)
        private readonly repo: Repository<IPermission>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    private readonly defaultRelations: string[] = ['resource', 'operation'];

    async pagination(
        request: PermissionPaginateV1Request,
    ): Promise<IPaginateData<IPermission>> {
        const alias = this.metadata.name;

        const ALLOWED_SORTS = new Map<string, string>([
            ['name', `${alias}.name`],
            ['key', `${alias}.key`],
            ['updated_at', `${alias}.updatedAt`],
            ['created_at', `${alias}.createdAt`],
        ]);

        const query = this.createQueryBuilder(this.metadata.name)
            .leftJoinAndSelect(`${alias}.resource`, 'resource')
            .leftJoinAndSelect(`${alias}.operation`, 'operation');

        // Validate the sort value in the request
        QueryFilterUtil.validateSortValueDto(request, ALLOWED_SORTS);

        QueryFilterUtil.applyFilters(query, {
            search: request.search
                ? {
                      term: request.search,
                      fields: [
                          { name: `${alias}.name`, type: 'string' },
                          { name: `${alias}.key`, type: 'string' },
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

        return { meta, items };
    }

    async paginationByRoleId(
        roleId: string,
        request: RolePermissionPaginateV1Request,
    ): Promise<IPaginateData<IPermission>> {
        const alias = this.metadata.name;

        const ALLOWED_SORTS = new Map<string, string>([
            ['name', `${alias}.name`],
            ['key', `${alias}.key`],
            ['updated_at', `${alias}.updatedAt`],
            ['created_at', `${alias}.createdAt`],
        ]);

        const query = this.createQueryBuilder(this.metadata.name)
            .leftJoinAndSelect(`${alias}.roles`, 'role')
            .leftJoinAndSelect(`${alias}.resource`, 'resource')
            .leftJoinAndSelect(`${alias}.operation`, 'operation')
            .where('role.id = :roleId', { roleId });

        // Validate the sort value in the request
        QueryFilterUtil.validateSortValueDto(request, ALLOWED_SORTS);

        QueryFilterUtil.applyFilters(query, {
            search: request.search
                ? {
                      term: request.search,
                      fields: [
                          { name: `${alias}.name`, type: 'string' },
                          { name: `${alias}.key`, type: 'string' },
                      ],
                  }
                : null,
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

        return { meta, items };
    }

    async findOrFailByIdWithRelations(
        id: string,
        relations?: string[],
    ): Promise<IPermission> {
        return await this.findOneOrFail({
            where: {
                id,
            },
            relations: relations || this.defaultRelations,
        });
    }
}
