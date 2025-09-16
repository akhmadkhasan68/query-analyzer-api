import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPlatform } from 'src/infrastructures/databases/entities/interfaces/platform.interface';
import { Platform } from 'src/infrastructures/databases/entities/platform.entity';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { TypeORMQueryFilterUtil } from 'src/shared/utils/typeorm-query-filter.util';
import { TypeORMQuerySortingUtil } from 'src/shared/utils/typeorm-query-sort.util';
import { In, QueryRunner, Repository } from 'typeorm';
import { PlatformPaginateV1Request } from '../dtos/requests/platform-paginate-v1.request';

@Injectable()
export class PlatformV1Repository extends Repository<IPlatform> {
    constructor(
        @InjectRepository(Platform)
        private readonly platformRepository: Repository<IPlatform>,
    ) {
        super(
            platformRepository.target,
            platformRepository.manager,
            platformRepository.queryRunner,
        );
    }

    async findOneByIdOrFail(id: string): Promise<IPlatform> {
        return await this.platformRepository.findOneByOrFail({ id });
    }

    async paginate(
        request: PlatformPaginateV1Request,
    ): Promise<IPaginateData<IPlatform>> {
        const alias = this.metadata.name;

        const ALLOWED_SORTS = new Map<string, string>([
            ['framework', `${alias}.framework`],
            ['ormProvider', `${alias}.ormProvider`],
            ['databaseProvider', `${alias}.databaseProvider`],
            ['updated_at', `${alias}.updatedAt`],
            ['created_at', `${alias}.createdAt`],
        ]);

        const query = this.createQueryBuilder(alias);

        TypeORMQueryFilterUtil.validateSortValueDto(request, ALLOWED_SORTS);

        TypeORMQueryFilterUtil.applyFilters(query, {
            search: request.search
                ? {
                      term: request.search,
                      fields: [
                          { name: `${alias}.framework`, type: 'string' },
                          { name: `${alias}.ormProvider`, type: 'string' },
                          { name: `${alias}.databaseProvider`, type: 'string' },
                      ],
                  }
                : null,
            filters: [
                {
                    field: `${alias}.framework`,
                    value: request.framework,
                },
                {
                    field: `${alias}.ormProvider`,
                    value: request.ormProvider,
                },
                {
                    field: `${alias}.databaseProvider`,
                    value: request.databaseProvider,
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

        return {
            meta,
            items,
        };
    }

    async findByFrameworkAndProvider(
        framework: string,
        ormProvider: string,
        databaseProvider: string,
    ) {
        return await this.platformRepository.findOne({
            where: {
                framework,
                ormProvider,
                databaseProvider,
            },
        });
    }

    async saveWithTransaction(
        queryRunner: QueryRunner,
        entity: IPlatform,
    ): Promise<IPlatform> {
        return queryRunner.manager
            .getRepository(this.platformRepository.target)
            .save(entity);
    }

    async findOneById(id: string): Promise<IPlatform | null> {
        return this.platformRepository.findOne({
            where: { id },
        });
    }

    async deleteByIdsWithTransaction(
        queryRunner: QueryRunner,
        ids: string[],
    ): Promise<void> {
        await queryRunner.manager
            .getRepository(this.platformRepository.target)
            .softDelete({
                id: In(ids),
            });
    }
}
