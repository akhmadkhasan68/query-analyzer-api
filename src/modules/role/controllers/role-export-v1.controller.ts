import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { Permission } from 'src/modules/iam/shared/decorators/permission.decorator';
import { JwtAuthTypeEnum } from 'src/modules/iam/shared/enums/token-type.enum';
import { RoleV1Service } from 'src/modules/role/services/role-v1.service';
import { OPERATION, RESOURCE } from 'src/shared/constants/permission.constant';
import { RolePaginateV1Request } from '../dtos/requests/role-paginate-v1.request';
import { RoleV1Response } from '../dtos/responses/role-v1.response';

@Controller({
    path: 'roles/export',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class RoleExportV1Controller {
    constructor(private readonly roleV1Service: RoleV1Service) {}

    @Permission(RESOURCE.USER, [OPERATION.EXPORT])
    @Get('pdf')
    async exportRolesToPdf(
        @Query() queryDto: RolePaginateV1Request,
        @Res() response: Response,
    ): Promise<void> {
        const result = await this.roleV1Service.paginate(queryDto);
        const buffer = await this.roleV1Service.generatePdf(
            RoleV1Response.MapEntities(result.items),
        );

        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader(
            'Content-Disposition',
            'attachment; filename=roles_export.pdf',
        );
        response.send(buffer);
    }
}
