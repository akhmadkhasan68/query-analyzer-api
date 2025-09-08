import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permission } from 'src/modules/iam/shared/decorators/permission.decorator';
import { JwtAuthTypeEnum } from 'src/modules/iam/shared/enums/token-type.enum';
import { PermissionV1Response } from 'src/modules/permission/dtos/responses/permission-v1.response';
import { OPERATION, RESOURCE } from 'src/shared/constants/permission.constant';
import { IPaginationResponse } from 'src/shared/interfaces/paginate-response.interface';
import { RolePermissionPaginateV1Request } from '../dtos/requests/role-permission-paginate-v1.request';
import { RoleV1Service } from '../services/role-v1.service';

@Controller({
    path: 'roles/:roleId/permissions',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class RolePermissionV1Controller {
    constructor(private readonly roleV1Service: RoleV1Service) {}

    @Permission(RESOURCE.ROLE, [OPERATION.VIEW])
    @Get()
    async paginate(
        @Param('roleId') roleId: string,
        @Query() paginationDto: RolePermissionPaginateV1Request,
    ): Promise<IPaginationResponse<PermissionV1Response>> {
        const result = await this.roleV1Service.paginatePermission(
            roleId,
            paginationDto,
        );

        return {
            data: {
                meta: result.meta,
                items: PermissionV1Response.MapEntities(result.items),
            },

            message: 'Role pagination retrieved successfully',
        };
    }
}
