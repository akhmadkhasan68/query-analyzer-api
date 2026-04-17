import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthTypeEnum } from 'src/modules/iam/shared/enums/token-type.enum';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { IPaginationResponse } from 'src/shared/interfaces/paginate-response.interface';
import { GitlabFileV1Request } from '../dtos/requests/gitlab-file-v1.request';
import { GitlabProjectPaginateV1Request } from '../dtos/requests/gitlab-project-paginate-v1.request';
import { GitlabFileV1Response } from '../dtos/responses/gitlab-file-v1.response';
import { GitlabProjectV1Response } from '../dtos/responses/gitlab-project-v1.response';
import { GitlabV1Service } from '../services/gitlab-v1.service';

@Controller({
    path: 'gitlab',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class GitlabV1Controller {
    constructor(private readonly gitlabV1Service: GitlabV1Service) {}

    @Get('health')
    async healthCheck(): Promise<
        IBasicResponse<{ status: string; host: string }>
    > {
        const data = await this.gitlabV1Service.checkHealth();
        return {
            message: 'GitLab integration health check passed',
            data,
        };
    }

    @Get('projects')
    async listProjects(
        @Query() paginationDto: GitlabProjectPaginateV1Request,
    ): Promise<IPaginationResponse<GitlabProjectV1Response>> {
        const result =
            await this.gitlabV1Service.listProjects(paginationDto);
        return {
            message: 'GitLab projects retrieved successfully',
            data: {
                items: result.items,
                meta: result.meta,
            },
        };
    }

    @Get('projects/:projectId/files')
    async getFile(
        @Param('projectId', ParseIntPipe) projectId: number,
        @Query() fileDto: GitlabFileV1Request,
    ): Promise<IBasicResponse<GitlabFileV1Response>> {
        const data = await this.gitlabV1Service.getFileContent(
            projectId,
            fileDto.filePath,
            fileDto.ref,
        );
        return {
            message: 'GitLab file retrieved successfully',
            data,
        };
    }
}
