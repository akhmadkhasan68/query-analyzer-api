import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { Permission } from 'src/modules/iam/shared/decorators/permission.decorator';
import { JwtAuthTypeEnum } from 'src/modules/iam/shared/enums/token-type.enum';
import { OPERATION, RESOURCE } from 'src/shared/constants/permission.constant';
import { PermissionPaginateV1Request } from '../dtos/requests/permission-paginate-v1.request';
import { PermissionV1Response } from '../dtos/responses/permission-v1.response';
import { PermissionV1Service } from '../services/permission-v1.service';

@Controller({
    path: 'permissions/export',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class PermissionExportV1Controller {
    constructor(private readonly permissionV1Service: PermissionV1Service) {}

    @Permission(RESOURCE.USER, [OPERATION.EXPORT])
    @Get('pdf')
    async exportPermissionsToPdf(
        @Query() queryDto: PermissionPaginateV1Request,
        @Res() response: Response,
    ): Promise<void> {
        const result = await this.permissionV1Service.paginate(queryDto);
        const buffer = await this.permissionV1Service.generatePdf(
            PermissionV1Response.MapEntities(result.items),
        );

        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader(
            'Content-Disposition',
            'attachment; filename=permissions_export.pdf',
        );
        response.send(buffer);
    }
}
