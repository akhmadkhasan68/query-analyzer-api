import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Query,
} from '@nestjs/common';
import { Permission } from 'src/modules/iam/shared/decorators/permission.decorator';
import { OPERATION, RESOURCE } from 'src/shared/constants/permission.constant';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { IPaginationResponse } from 'src/shared/interfaces/paginate-response.interface';
import { ProjectSlackChannelCreateV1Request } from '../dtos/requests/project-slack-channel-create-v1.request';
import { ProjectSlackChannelDeleteV1Request } from '../dtos/requests/project-slack-channel-delete-v1.request';
import { ProjectSlackChannelPaginateV1Request } from '../dtos/requests/project-slack-channel-paginate-v1.request';
import { ProjectSlackChannelV1Response } from '../dtos/responses/project-slack-channel-v1.response';
import { ProjectSlackChannelV1Service } from '../services/project-slack-channel-v1.service';

@Controller({
    path: 'projects/:projectId/slack-channels',
    version: '1',
})
export class ProjectSlackChannelV1Controller {
    constructor(
        private readonly projectSlackChannelV1Service: ProjectSlackChannelV1Service,
    ) {}

    @Permission(RESOURCE.PROJECT_SLACK_CHANNEL, [OPERATION.VIEW])
    @Get()
    /**
     * Retrieves paginated project key data based on provided pagination parameters
     *
     * @param {ProjectSlackChannelPaginateV1Request} paginationDto - The pagination parameters for project key data
     * @returns {Promise<IPaginationResponse<ProjectSlackChannelV1Response>>} A promise that resolves to paginated project key response data
     *
     * @example
     * const result = await pagination({
     *   page: 1,
     *   limit: 10
     * });
     *
     * @throws {Error} If pagination operation fails
     */
    async paginate(
        @Param('projectId') projectId: string,
        @Query() paginationDto: ProjectSlackChannelPaginateV1Request,
    ): Promise<IPaginationResponse<ProjectSlackChannelV1Response>> {
        const result = await this.projectSlackChannelV1Service.paginate(
            projectId,
            paginationDto,
        );

        return {
            data: {
                meta: result.meta,
                items: ProjectSlackChannelV1Response.MapEntities(result.items),
            },

            message: 'Project slack channel pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.PROJECT_SLACK_CHANNEL, [OPERATION.CREATE])
    @Post()
    async create(
        @Param('projectId', ParseUUIDPipe) projectId: string,
        @Body() createDto: ProjectSlackChannelCreateV1Request,
    ): Promise<IBasicResponse<ProjectSlackChannelV1Response>> {
        const result = await this.projectSlackChannelV1Service.create(
            projectId,
            createDto,
        );

        return {
            data: ProjectSlackChannelV1Response.FromEntity(result),
            message: 'Project slack channel created successfully',
        };
    }

    @Permission(RESOURCE.PROJECT_SLACK_CHANNEL, [OPERATION.DELETE])
    @Delete()
    async delete(
        @Param('projectId') projectId: string,
        @Body() deleteDto: ProjectSlackChannelDeleteV1Request,
    ): Promise<IBasicResponse<void>> {
        const { ids } = deleteDto;
        await this.projectSlackChannelV1Service.findByIds(ids);
        await this.projectSlackChannelV1Service.delete(ids);

        return {
            message: 'Project key deleted successfully',
        };
    }
}
