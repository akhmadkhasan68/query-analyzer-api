import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IProjectSetting } from 'src/infrastructures/databases/entities/interfaces/project-setting.interface';
import { ProjectSetting } from 'src/infrastructures/databases/entities/project-setting.entity';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { TypeORMQueryFilterUtil } from 'src/shared/utils/typeorm-query-filter.util';
import { TypeORMQuerySortingUtil } from 'src/shared/utils/typeorm-query-sort.util';
import { Repository } from 'typeorm';
import { ProjectSettingPaginateV1Request } from '../dtos/requests/project-setting-paginate-v1.request';
import { ProjectSettingKeyEnum } from '../shared/enums/project-setting-key.enum';

@Injectable()
export class ProjectSettingV1Repository extends Repository<IProjectSetting> {
    constructor(
        @InjectRepository(ProjectSetting)
        private readonly repo: Repository<IProjectSetting>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async paginate(
        projectId: string,
        request: ProjectSettingPaginateV1Request,
    ): Promise<IPaginateData<IProjectSetting>> {
        const alias = this.metadata.name;
        const ALLOWED_SORTS = new Map<string, string>([
            ['key', `${alias}.key`],
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
                      fields: [{ name: `${alias}.key`, type: 'string' }],
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

    async findOneById(id: string): Promise<IProjectSetting | null> {
        return this.repo.findOne({ where: { id } });
    }

    async findOneByIdOrFail(id: string): Promise<IProjectSetting> {
        return this.repo.findOneOrFail({ where: { id } });
    }

    async findOneByProjectIdAndKey(
        projectId: string,
        key: ProjectSettingKeyEnum,
    ): Promise<IProjectSetting | null> {
        return this.repo.findOne({
            where: { project: { id: projectId }, key },
        });
    }

    async findOneByProjectIdAndKeyOrFail(
        projectId: string,
        key: ProjectSettingKeyEnum,
    ): Promise<IProjectSetting> {
        return this.repo.findOneOrFail({
            where: { project: { id: projectId }, key },
        });
    }

    async findOneByProjectId(
        projectId: string,
    ): Promise<IProjectSetting | null> {
        return this.repo.findOne({
            where: { project: { id: projectId } },
        });
    }

    async findOneByProjectIdOrFail(
        projectId: string,
    ): Promise<IProjectSetting> {
        return this.repo.findOneOrFail({
            where: { project: { id: projectId } },
        });
    }
}
