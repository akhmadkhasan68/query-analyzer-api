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
import { ProjectSettingCreateV1Request } from '../dtos/requests/project-setting-create-v1.request';
import { ProjectSettingDeleteV1Request } from '../dtos/requests/project-setting-delete-v1.request';
import { ProjectSettingPaginateV1Request } from '../dtos/requests/project-setting-paginate-v1.request';
import { ProjectSettingV1Response } from '../dtos/responses/project-setting-v1.response';
import { ProjectSettingV1Service } from '../services/project-setting-v1.service';

@Controller({
    path: 'projects/:projectId/settings',
    version: '1',
})
export class ProjectSettingV1Controller {
    constructor(
        private readonly projectSettingV1Service: ProjectSettingV1Service,
    ) {}

    @Permission(RESOURCE.PROJECT_SETTING, [OPERATION.VIEW])
    @Get()
    /**
     * Retrieves paginated project key data based on provided pagination parameters
     *
     * @param {ProjectSlackChannelPaginateV1Request} paginationDto - The pagination parameters for project key data
     * @returns {Promise<IPaginationResponse<ProjectSettingV1Response>>} A promise that resolves to paginated project key response data
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
        @Query() paginationDto: ProjectSettingPaginateV1Request,
    ): Promise<IPaginationResponse<ProjectSettingV1Response>> {
        const result = await this.projectSettingV1Service.paginate(
            projectId,
            paginationDto,
        );

        return {
            data: {
                meta: result.meta,
                items: ProjectSettingV1Response.MapEntities(result.items),
            },

            message: 'Project setting pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.PROJECT_SLACK_CHANNEL, [OPERATION.CREATE])
    @Post()
    async create(
        @Param('projectId', ParseUUIDPipe) projectId: string,
        @Body() createDto: ProjectSettingCreateV1Request,
    ): Promise<IBasicResponse<ProjectSettingV1Response>> {
        const result = await this.projectSettingV1Service.createOrUpdate(
            projectId,
            createDto,
        );

        return {
            data: ProjectSettingV1Response.FromEntity(result),
            message: 'Project setting created successfully',
        };
    }

    @Permission(RESOURCE.PROJECT_SETTING, [OPERATION.DELETE])
    @Delete()
    async delete(
        @Param('projectId') projectId: string,
        @Body() deleteDto: ProjectSettingDeleteV1Request,
    ): Promise<IBasicResponse<void>> {
        const { ids } = deleteDto;
        await this.projectSettingV1Service.findByIds(ids);
        await this.projectSettingV1Service.delete(ids);

        return {
            message: 'Project key deleted successfully',
        };
    }
}
