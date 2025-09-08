import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { FileMimeConstant } from 'src/shared/constants/file-mime.constant';
import { OPERATION, RESOURCE } from 'src/shared/constants/permission.constant';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { ERROR_MESSAGE_CONSTANT } from '../../../shared/constants/error-message.constant';
import { Permission } from '../../iam/shared/decorators/permission.decorator';
import { JwtAuthTypeEnum } from '../../iam/shared/enums/token-type.enum';
import { UserImportCsvV1Request } from '../dtos/requests/user-import-csv-v1.request';
import { UserImportExcelV1Request } from '../dtos/requests/user-import-excel-v1.request';
import { UserV1Response } from '../dtos/responses/user-v1.response';
import { UserV1Service } from '../services/user-v1.service';

@Controller({
    path: 'users/import',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class UserImportV1Controller {
    constructor(private readonly userV1Service: UserV1Service) {}

    @Permission(RESOURCE.USER, [OPERATION.EXPORT])
    @Get('excel-template')
    async downloadImportTemplate(@Res() res: Response) {
        const filePath = join(__dirname, '../templates/excel/User.xlsx');
        res.setHeader('Content-Type', FileMimeConstant.Xlsx);
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=UserImportTemplate.xlsx',
        );
        const stream = createReadStream(filePath);
        stream.pipe(res);
    }

    @Permission(RESOURCE.USER, [OPERATION.EXPORT])
    @Post('excel')
    @UseInterceptors(FileInterceptor('file'))
    async importExcel(
        @UploadedFile() file: Express.Multer.File,
        @Body() importExcelDto: UserImportExcelV1Request,
    ): Promise<IBasicResponse<UserV1Response[]>> {
        if (!file) {
            throw new BadRequestException(
                'No file uploaded. Please provide a file.',
            );
        }

        const allowedMimeTypes = [
            FileMimeConstant.Xlsx,
            FileMimeConstant.Xls,
        ] as string[];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                ERROR_MESSAGE_CONSTANT.InvalidSpecificFileMimeType(
                    allowedMimeTypes,
                ),
            );
        }

        const result = await this.userV1Service.importExcel(
            file.buffer,
            importExcelDto,
        );

        return {
            message: 'Import users from Excel success',
            data: UserV1Response.MapEntities(result),
        };
    }

    @Permission(RESOURCE.USER, [OPERATION.EXPORT])
    @Post('excel-multi-sheet')
    @UseInterceptors(FileInterceptor('file'))
    async importExcelMultiSheet(
        @UploadedFile() file: Express.Multer.File,
    ): Promise<IBasicResponse<UserV1Response[]>> {
        if (!file) {
            throw new BadRequestException(
                'No file uploaded. Please provide a file.',
            );
        }

        const allowedMimeTypes = [
            FileMimeConstant.Xlsx,
            FileMimeConstant.Xls,
        ] as string[];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                ERROR_MESSAGE_CONSTANT.InvalidSpecificFileMimeType(
                    allowedMimeTypes,
                ),
            );
        }

        const result = await this.userV1Service.importExcelMultiSheet(
            file.buffer,
        );

        return {
            message: 'Import users from Excel success',
            data: UserV1Response.MapEntities(result),
        };
    }

    @Permission(RESOURCE.USER, [OPERATION.EXPORT])
    @Get('csv-template')
    async downloadImportCsvTemplate(@Res() res: Response) {
        const filePath = join(__dirname, '../templates/csv/User.csv');
        res.setHeader('Content-Type', FileMimeConstant.Csv);
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=UserImportTemplate.csv',
        );
        const stream = createReadStream(filePath);
        stream.pipe(res);
    }

    @Permission(RESOURCE.USER, [OPERATION.EXPORT])
    @Post('csv')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                delimiter: {
                    type: 'string',
                    default: ';',
                    maxLength: 1,
                },
            },
            required: ['file'],
        },
    })
    async importCsv(
        @UploadedFile() file: Express.Multer.File,
        @Body() importCsvDto: UserImportCsvV1Request,
    ): Promise<IBasicResponse<UserV1Response[]>> {
        if (!file) {
            throw new BadRequestException(ERROR_MESSAGE_CONSTANT.FileUpload);
        }

        const allowedMimeTypes = [
            FileMimeConstant.Csv,
            FileMimeConstant.Xls,
        ] as string[];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                ERROR_MESSAGE_CONSTANT.InvalidSpecificFileMimeType(
                    allowedMimeTypes,
                ),
            );
        }

        const result = await this.userV1Service.importCsv(
            file.buffer,
            importCsvDto,
        );

        return {
            message: 'Import users from Csv success',
            data: UserV1Response.MapEntities(result),
        };
    }
}
