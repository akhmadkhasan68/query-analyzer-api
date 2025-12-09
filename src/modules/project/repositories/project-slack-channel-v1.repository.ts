import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IProjectSlackChannel } from 'src/infrastructures/databases/entities/interfaces/project-slack-channel.interface';
import { ProjectSlackChannel } from 'src/infrastructures/databases/entities/project-slack-channel.entity';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { TypeORMQueryFilterUtil } from 'src/shared/utils/typeorm-query-filter.util';
import { TypeORMQuerySortingUtil } from 'src/shared/utils/typeorm-query-sort.util';
import { In, QueryRunner, Repository } from 'typeorm';
import { ProjectSlackChannelPaginateV1Request } from '../dtos/requests/project-slack-channel-paginate-v1.request';

@Injectable()
export class ProjectSlackChannelV1Repository extends Repository<ProjectSlackChannel> {
    constructor(
        @InjectRepository(ProjectSlackChannel)
        private readonly repo: Repository<IProjectSlackChannel>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async paginate(
        projectId: string,
        request: ProjectSlackChannelPaginateV1Request,
    ): Promise<IPaginateData<IProjectSlackChannel>> {
        const alias = this.metadata.name;
        const ALLOWED_SORTS = new Map<string, string>([
            ['slackChannelId', `${alias}.slackChannelId`],
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
                      fields: [
                          { name: `${alias}.slackChannelId`, type: 'string' },
                      ],
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

    async findByProjectIds(
        projectIds: string[],
    ): Promise<IProjectSlackChannel[]> {
        return this.find({
            where: {
                projectId: In(projectIds),
            },
        });
    }

    async findByProjectId(projectId: string): Promise<IProjectSlackChannel[]> {
        return this.find({
            where: {
                projectId,
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
