import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permission } from 'src/modules/iam/shared/decorators/permission.decorator';
import { JwtAuthTypeEnum } from 'src/modules/iam/shared/enums/token-type.enum';
import { OPERATION, RESOURCE } from 'src/shared/constants/permission.constant';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { IPaginationResponse } from 'src/shared/interfaces/paginate-response.interface';
import {
    PlatformCreateV1Request,
    PlatformDeleteByIdsV1Request,
    PlatformUpdateV1Request,
} from '../dtos/requests/platform-create-v1.request';
import { PlatformPaginateV1Request } from '../dtos/requests/platform-paginate-v1.request';
import { PlatformV1Response } from '../dtos/responses/platform-v1.response';
import { PlatformV1Service } from '../services/platform-v1.service';

@Controller({
    path: 'platforms',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class PlatformV1Controller {
    constructor(private readonly platformV1Service: PlatformV1Service) {}

    @Permission(RESOURCE.PROJECT, [OPERATION.VIEW])
    @Get()
    /**
     * Retrieves paginated platform data based on provided pagination parameters
     *
     * @param {PlatformPaginateV1Request} paginationDto - The pagination parameters for platform data
     * @returns {Promise<IPaginationResponse<PlatformV1Response>>} A promise that resolves to paginated platform response data
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
        @Query() paginationDto: PlatformPaginateV1Request,
    ): Promise<IPaginationResponse<PlatformV1Response>> {
        const result = await this.platformV1Service.paginate(paginationDto);

        return {
            data: {
                meta: result.meta,
                items: PlatformV1Response.MapEntities(result.items),
            },

            message: 'Platform pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.PROJECT, [OPERATION.VIEW])
    @Get(':id')
    async detail(
        @Param('id') id: string,
    ): Promise<IBasicResponse<PlatformV1Response>> {
        const result = await this.platformV1Service.detail(id);

        return {
            data: PlatformV1Response.FromEntity(result),
            message: 'Platform detail retrieved successfully',
        };
    }

    @Permission(RESOURCE.PROJECT, [OPERATION.CREATE])
    @Post()
    async create(
        @Body() createDto: PlatformCreateV1Request,
    ): Promise<IBasicResponse<PlatformV1Response>> {
        const result = await this.platformV1Service.create(createDto);
        return {
            data: PlatformV1Response.FromEntity(result),
            message: 'Platform created successfully',
        };
    }

    @Permission(RESOURCE.PROJECT, [OPERATION.UPDATE])
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateDto: PlatformUpdateV1Request,
    ): Promise<IBasicResponse<PlatformV1Response>> {
        await this.platformV1Service.update(id, updateDto);

        return {
            message: 'Platform updated successfully',
        };
    }

    @Permission(RESOURCE.PROJECT, [OPERATION.DELETE])
    @Delete()
    async deleteByIds(
        @Body() deleteByIdsDto: PlatformDeleteByIdsV1Request,
    ): Promise<IBasicResponse<PlatformV1Response>> {
        await this.platformV1Service.deleteByIds(
            deleteByIdsDto.ids,
        );

        return {
            message: 'Platforms deleted successfully',
        };
    }
}
