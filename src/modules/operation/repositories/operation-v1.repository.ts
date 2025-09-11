import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IOperation } from 'src/infrastructures/databases/entities/interfaces/operation.interface';
import { Operation } from 'src/infrastructures/databases/entities/operation.entity';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { TypeORMQueryFilterUtil } from 'src/shared/utils/typeorm-query-filter.util';
import { TypeORMQuerySortingUtil } from 'src/shared/utils/typeorm-query-sort.util';
import { Repository } from 'typeorm';
import { OperationPaginateV1Request } from '../dtos/requests/operation-paginate-v1.request';

@Injectable()
export class OperationV1Repository extends Repository<IOperation> {
    constructor(
        @InjectRepository(Operation)
        private readonly repo: Repository<IOperation>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async pagination(
        request: OperationPaginateV1Request,
    ): Promise<IPaginateData<IOperation>> {
        const alias = this.metadata.name;

        const ALLOWED_SORTS = new Map<string, string>([
            ['name', `${alias}.name`],
            ['slug', `${alias}.slug`],
            ['updated_at', `${alias}.updatedAt`],
            ['created_at', `${alias}.createdAt`],
        ]);

        const query = this.createQueryBuilder(this.metadata.name);

        // Validate the sort value in the request
        TypeORMQueryFilterUtil.validateSortValueDto(request, ALLOWED_SORTS);

        TypeORMQueryFilterUtil.applyFilters(query, {
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

        return { meta, items };
    }

    async findOneByIdOrFail(id: string): Promise<IOperation> {
        return await this.findOneOrFail({
            where: {
                id,
            },
        });
    }
}
