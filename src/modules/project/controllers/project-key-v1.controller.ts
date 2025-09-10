import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthTypeEnum } from '../../iam/shared/enums/token-type.enum';
import { ProjectKeyV1Service } from '../services/project-key-v1.service';
import { Permission } from '../../iam/shared/decorators/permission.decorator';
import {
    OPERATION,
    RESOURCE,
} from '../../../shared/constants/permission.constant';
import { ProjectKeyPaginateV1Request } from '../dtos/requests/project-key-paginate-v1.request';
import { IPaginationResponse } from '../../../shared/interfaces/paginate-response.interface';
import { ProjectKeyV1Response } from '../dtos/responses/project-key-v1.response';
import { IBasicResponse } from '../../../shared/interfaces/basic-response.interface';
import { ProjectKeyCreateV1Request } from '../dtos/requests/project-key-create-v1.request';

@Controller({
    path: 'projects/:projectId/keys',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class ProjectKeyV1Controller {
    constructor(private readonly projectKeyV1Service: ProjectKeyV1Service) {}

    @Permission(RESOURCE.PROJECT, [OPERATION.VIEW])
    @Get()
    /**
     * Retrieves paginated project key data based on provided pagination parameters
     *
     * @param {ProjectKeyPaginateV1Request} paginationDto - The pagination parameters for project key data
     * @returns {Promise<IPaginationResponse<ProjectKeyV1Response>>} A promise that resolves to paginated project key response data
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
        @Query() paginationDto: ProjectKeyPaginateV1Request,
    ): Promise<IPaginationResponse<ProjectKeyV1Response>> {
        const result = await this.projectKeyV1Service.paginate(
            projectId,
            paginationDto,
        );

        return {
            data: {
                meta: result.meta,
                items: ProjectKeyV1Response.MapEntities(result.items),
            },

            message: 'Project key pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.PROJECT_KEY, [OPERATION.CREATE])
    @Post()
    async create(
        @Param('projectId') projectId: string,
        @Body() createDto: ProjectKeyCreateV1Request,
    ): Promise<IBasicResponse<ProjectKeyV1Response>> {
        createDto.projectId = projectId;
        const result = await this.projectKeyV1Service.create(createDto);
        return {
            data: ProjectKeyV1Response.FromEntity(result),
            message: 'Project key created successfully',
        };
    }

    @Permission(RESOURCE.PROJECT_KEY, [OPERATION.DELETE])
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<IBasicResponse<void>> {
        await this.projectKeyV1Service.delete(id);
        return {
            message: 'Project key deleted successfully',
        };
    }
}
