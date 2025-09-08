import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permission } from 'src/modules/iam/shared/decorators/permission.decorator';
import { JwtAuthTypeEnum } from 'src/modules/iam/shared/enums/token-type.enum';
import { OPERATION, RESOURCE } from 'src/shared/constants/permission.constant';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { IPaginationResponse } from 'src/shared/interfaces/paginate-response.interface';
import { ProjectCreateV1Request } from '../dtos/requests/project-create-v1.request';
import { ProjectPaginateV1Request } from '../dtos/requests/project-paginate-v1.request';
import { ProjectV1Response } from '../dtos/responses/project-v1.response';
import { ProjectV1Service } from '../services/project-v1.service';

@Controller({
    path: 'projects',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class ProjectV1Controller {
    constructor(private readonly projectV1Service: ProjectV1Service) {}

    @Permission(RESOURCE.PROJECT, [OPERATION.VIEW])
    @Get()
    /**
     * Retrieves paginated project data based on provided pagination parameters
     *
     * @param {ProjectPaginateV1Request} paginationDto - The pagination parameters for project data
     * @returns {Promise<IPaginationResponse<ProjectV1Response>>} A promise that resolves to paginated project response data
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
        @Query() paginationDto: ProjectPaginateV1Request,
    ): Promise<IPaginationResponse<ProjectV1Response>> {
        const result = await this.projectV1Service.paginate(paginationDto);

        return {
            data: {
                meta: result.meta,
                items: ProjectV1Response.MapEntities(result.items),
            },

            message: 'Project pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.PROJECT, [OPERATION.CREATE])
    @Post()
    async create(
        @Body() createDto: ProjectCreateV1Request,
    ): Promise<IBasicResponse<ProjectV1Response>> {
        const result = await this.projectV1Service.create(createDto);
        return {
            data: ProjectV1Response.FromEntity(result),
            message: 'Project created successfully',
        };
    }
}
