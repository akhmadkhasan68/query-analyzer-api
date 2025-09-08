import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { FileMimeConstant } from 'src/shared/constants/file-mime.constant';
import { OPERATION, RESOURCE } from 'src/shared/constants/permission.constant';
import { Permission } from '../../iam/shared/decorators/permission.decorator';
import { JwtAuthTypeEnum } from '../../iam/shared/enums/token-type.enum';
import { UserPaginateV1Request } from '../dtos/requests/user-paginate-v1.request';
import { UserV1Response } from '../dtos/responses/user-v1.response';
import { UserV1Service } from '../services/user-v1.service';

@Controller({
    path: 'users/export',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class UserExportV1Controller {
    constructor(private readonly userV1Service: UserV1Service) {}

    @Permission(RESOURCE.USER, [OPERATION.EXPORT])
    @Get('excel')
    /**
     * Exports user data to an Excel file
     * @param queryDto - Query parameters for filtering users
     * @param response - Express response object to send the Excel file
     * @returns {Promise<void>} Downloads Excel file with user data
     * @example
     * GET /v1/iam/users/export/excel
     */
    async exportUsersToExcel(
        @Query() queryDto: UserPaginateV1Request,
        @Res() response: Response,
    ): Promise<void> {
        const result = await this.userV1Service.paginate(queryDto);
        const buffer = await this.userV1Service.generateExcel(
            UserV1Response.MapEntities(result.items),
        );

        response.setHeader('Content-Type', FileMimeConstant.Xlsx);
        response.setHeader(
            'Content-Disposition',
            'attachment; filename=users_export.xlsx',
        );
        response.send(buffer);
    }

    @Permission(RESOURCE.USER, [OPERATION.EXPORT])
    @Get('excel-multi-sheet')
    /**
     * Exports user data to an Excel file
     * @param queryDto - Query parameters for filtering users
     * @param response - Express response object to send the Excel file
     * @returns {Promise<void>} Downloads Excel file with user data
     * @example
     * GET /v1/iam/users/export/excel-multi-sheet
     */
    async exportUsersToExcelMultiSheet(
        @Query() queryDto: UserPaginateV1Request,
        @Res() response: Response,
    ): Promise<void> {
        const result = await this.userV1Service.paginate(queryDto);
        const buffer = await this.userV1Service.generateExcelMultiSheet(
            UserV1Response.MapEntities(result.items),
        );

        response.setHeader('Content-Type', FileMimeConstant.Xlsx);
        response.setHeader(
            'Content-Disposition',
            'attachment; filename=users_export_multi.xlsx',
        );
        response.send(buffer);
    }

    @Permission(RESOURCE.USER, [OPERATION.EXPORT])
    @Get('csv')
    @ApiQuery({
        name: 'delimiter',
        required: false,
        type: String,
        example: ';',
        description: 'Optional CSV delimiter character (default: ";")',
    })
    /**
     * Exports user data to a CSV file
     *
     * @param queryDto - Query parameters for filtering users
     * @param delimiter - Optional delimiter for CSV (e.g., ',' or ';')
     * @param response - Express response object to send the CSV file
     * @returns {Promise<void>} Downloads CSV file with user data
     *
     * @example
     * GET /v1/iam/users/export/csv?page=1&limit=100&delimiter=;
     */
    async exportUsersToCsv(
        @Query() queryDto: UserPaginateV1Request,
        @Query('delimiter') delimiter: string = ';',
        @Res() response: Response,
    ): Promise<void> {
        const result = await this.userV1Service.paginate(queryDto);

        const buffer = await this.userV1Service.generateCsv(
            UserV1Response.MapEntities(result.items),
            delimiter,
        );

        response.setHeader('Content-Type', FileMimeConstant.Csv);
        response.setHeader(
            'Content-Disposition',
            'attachment; filename=users_export.csv',
        );
        response.send(buffer);
    }

    @Permission(RESOURCE.USER, [OPERATION.EXPORT])
    @Get('pdf')
    /**
     * Exports user data to a PDF file
     *
     * @param queryDto - Query parameters for filtering users
     * @param response - Express response object to send the PDF file
     * @returns {Promise<void>} Downloads PDF file with user data
     *
     * @example
     * GET /v1/iam/users/export/pdf
     */
    async exportUsersToPdf(
        @Query() queryDto: UserPaginateV1Request,
        @Res() response: Response,
    ): Promise<void> {
        const result = await this.userV1Service.paginate(queryDto);
        const buffer = await this.userV1Service.generatePdf(
            UserV1Response.MapEntities(result.items),
        );

        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader(
            'Content-Disposition',
            'attachment; filename=users_export.pdf',
        );
        response.send(buffer);
    }
}
