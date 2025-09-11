import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IResource } from 'src/infrastructures/databases/entities/interfaces/resource.interface';
import { Resource } from 'src/infrastructures/databases/entities/resource.entity';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { TypeORMQueryFilterUtil } from 'src/shared/utils/typeorm-query-filter.util';
import { TypeORMQuerySortingUtil } from 'src/shared/utils/typeorm-query-sort.util';
import { Repository } from 'typeorm';
import { ResourcePaginateV1Request } from '../dtos/requests/resource-paginate-v1.request';

@Injectable()
export class ResourceV1Repository extends Repository<IResource> {
    constructor(
        @InjectRepository(Resource)
        private readonly repo: Repository<IResource>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async pagination(
        request: ResourcePaginateV1Request,
    ): Promise<IPaginateData<IResource>> {
        const alias = this.metadata.name;

        const ALLOWED_SORTS = new Map<string, string>([
            ['name', `${alias}.name`],
            ['slug', `${alias}.slug`],
            ['description', `${alias}.description`],
            ['updated_at', `${alias}.updatedAt`],
            ['created_at', `${alias}.createdAt`],
        ]);

        const query = this.createQueryBuilder(this.metadata.name);

        TypeORMQueryFilterUtil.validateSortValueDto(request, ALLOWED_SORTS);

        TypeORMQueryFilterUtil.applyFilters(query, {
            search: request.search
                ? {
                      term: request.search,
                      fields: [
                          { name: `${alias}.name`, type: 'string' },
                          { name: `${alias}.slug`, type: 'string' },
                          { name: `${alias}.description`, type: 'string' },
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

        TypeORMQuerySortingUtil.applySorting(query, {
            sort: request.sort,
            order: request.order,
            allowedSorts: ALLOWED_SORTS,
        });

        query.take(request.perPage);
        query.skip(PaginationUtil.countOffset(request));

        const [items, count] = await query.getManyAndCount();

        const meta = PaginationUtil.mapMeta(count, request);

        return { meta, items };
    }

    async findOneByIdOrFail(id: string): Promise<IResource> {
        return await this.findOneOrFail({
            where: {
                id,
            },
        });
    }
}
