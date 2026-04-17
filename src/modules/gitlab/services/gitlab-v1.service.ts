import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from 'nestjs-http-promise';
import { IPaginateData, IPaginateMeta } from 'src/shared/interfaces/paginate-response.interface';
import { GitlabProjectPaginateV1Request } from '../dtos/requests/gitlab-project-paginate-v1.request';
import {
    GitlabFileV1Response,
    IGitlabFile,
} from '../dtos/responses/gitlab-file-v1.response';
import {
    GitlabProjectV1Response,
    IGitlabProject,
} from '../dtos/responses/gitlab-project-v1.response';
import { GitlabRouteConstant } from '../shared/constants/gitlab-route.constant';

@Injectable()
export class GitlabV1Service {
    private readonly logger = new Logger(GitlabV1Service.name);

    constructor(private readonly httpService: HttpService) {}

    async checkHealth(): Promise<{
        status: string;
        host: string;
    }> {
        try {
            await this.httpService.get(GitlabRouteConstant.version);

            return {
                status: 'connected',
                host: this.httpService.axiosRef.defaults.baseURL || '',
            };
        } catch (error) {
            this.logger.error(
                `GitLab health check failed: ${error.message}`,
            );

            throw error;
        }
    }

    async listProjects(
        request: GitlabProjectPaginateV1Request,
    ): Promise<IPaginateData<GitlabProjectV1Response>> {
        const params: Record<string, any> = {
            page: request.page,
            per_page: request.perPage,
            order_by: request.sort === 'updated_at' ? 'updated_at' : request.sort,
            sort: request.order?.toLowerCase(),
        };

        if (request.search) {
            params.search = request.search;
        }

        const response = await this.httpService.get<IGitlabProject[]>(
            GitlabRouteConstant.projects,
            { params },
        );

        const meta = this.extractPaginationMeta(
            response.headers,
            request.page,
            request.perPage,
        );

        return {
            items: GitlabProjectV1Response.MapEntities(response.data),
            meta,
        };
    }

    async getFileContent(
        projectId: number,
        filePath: string,
        ref: string,
    ): Promise<GitlabFileV1Response> {
        const endpoint = GitlabRouteConstant.repositoryFile(
            projectId,
            filePath,
        );

        const response = await this.httpService.get<IGitlabFile>(endpoint, {
            params: { ref },
        });

        return GitlabFileV1Response.FromEntity(response.data);
    }

    private extractPaginationMeta(
        headers: Record<string, any>,
        page: number,
        perPage: number,
    ): IPaginateMeta {
        const total = parseInt(headers['x-total'] || '0', 10);
        const totalPage = parseInt(headers['x-total-pages'] || '0', 10);

        return {
            page,
            perPage,
            total,
            totalPage,
        };
    }
}
