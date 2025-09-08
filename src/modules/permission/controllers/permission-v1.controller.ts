import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permission } from 'src/modules/iam/shared/decorators/permission.decorator';
import { JwtAuthTypeEnum } from 'src/modules/iam/shared/enums/token-type.enum';
import { OPERATION, RESOURCE } from 'src/shared/constants/permission.constant';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { IPaginationResponse } from 'src/shared/interfaces/paginate-response.interface';
import { PermissionPaginateV1Request } from '../dtos/requests/permission-paginate-v1.request';
import { PermissionV1Response } from '../dtos/responses/permission-v1.response';
import { PermissionV1Service } from '../services/permission-v1.service';

@Controller({
    path: 'permissions',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class PermissionV1Controller {
    constructor(private readonly permissionV1Service: PermissionV1Service) {}

    @Permission(RESOURCE.PERMISSION, [OPERATION.VIEW])
    @Get()
    async paginate(
        @Query() paginationDto: PermissionPaginateV1Request,
    ): Promise<IPaginationResponse<PermissionV1Response>> {
        const result = await this.permissionV1Service.paginate(paginationDto);

        return {
            data: {
                meta: result.meta,
                items: PermissionV1Response.MapEntities(result.items),
            },

            message: 'Permission pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.PERMISSION, [OPERATION.VIEW])
    @Get(':permissionId')
    async getById(
        @Param('permissionId') permissionId: string,
    ): Promise<IBasicResponse<PermissionV1Response>> {
        const data = await this.permissionV1Service.findOneById(permissionId);

        return {
            data: PermissionV1Response.FromEntity(data),
            message: 'Permission retrieved successfully',
        };
    }
}
