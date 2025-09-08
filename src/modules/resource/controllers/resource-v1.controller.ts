import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permission } from 'src/modules/iam/shared/decorators/permission.decorator';
import { JwtAuthTypeEnum } from 'src/modules/iam/shared/enums/token-type.enum';
import { OPERATION, RESOURCE } from 'src/shared/constants/permission.constant';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { IPaginationResponse } from 'src/shared/interfaces/paginate-response.interface';
import { ResourcePaginateV1Request } from '../dtos/requests/resource-paginate-v1.request';
import { ResourceV1Response } from '../dtos/responses/resource-v1.response';
import { ResourceV1Service } from '../services/resource-v1.service';

@Controller({
    path: 'resources',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class ResourceV1Controller {
    constructor(private readonly resourceV1Service: ResourceV1Service) {}

    @Permission(RESOURCE.PERMISSION, [OPERATION.VIEW])
    @Get()
    async paginate(
        @Query() paginationDto: ResourcePaginateV1Request,
    ): Promise<IPaginationResponse<ResourceV1Response>> {
        const result = await this.resourceV1Service.paginate(paginationDto);

        return {
            data: {
                meta: result.meta,
                items: ResourceV1Response.MapEntities(result.items),
            },

            message: 'Resource pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.PERMISSION, [OPERATION.VIEW])
    @Get(':id')
    async findOne(
        @Param('id') id: string,
    ): Promise<IBasicResponse<ResourceV1Response>> {
        const result = await this.resourceV1Service.findOneById(id);

        return {
            data: ResourceV1Response.FromEntity(result),
            message: 'Resource retrieved successfully',
        };
    }
}
