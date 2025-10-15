import {
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcludeGlobalGuard } from 'src/modules/iam/shared/decorators/public.decorator';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { StorageFileV1Response } from '../dtos/responses/storage-file-v1.response';
import { StorageFileV1Service } from '../services/storage-file-v1.service';

@Controller({
    path: 'storage-file',
    version: '1',
})
export class StorageFileV1Controller {
    constructor(private readonly storageFileService: StorageFileV1Service) {}

    @Post('/upload')
    @ExcludeGlobalGuard()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
    ): Promise<IBasicResponse<StorageFileV1Response | null>> {
        if (!file) {
            return {
                message: 'No file uploaded',
                data: null,
            };
        }

        const uploadResult = await this.storageFileService.uploadFile(file);
        const fileUrl = await this.storageFileService.storageFactoryService
            .setStorageDriverService(uploadResult.driver)
            .getFileUrl(uploadResult.path, uploadResult.mimetype);

        return {
            message: 'File uploaded successfully',
            data: StorageFileV1Response.FromEntity(uploadResult, fileUrl),
        };
    }

    @Get('/:id')
    @ExcludeGlobalGuard()
    async getFile(
        @Param('id') id: string,
    ): Promise<IBasicResponse<StorageFileV1Response | null>> {
        const file = await this.storageFileService.getFile(id);

        const fileUrl = await this.storageFileService.storageFactoryService
            .setStorageDriverService(file.driver)
            .getFileUrl(file.path, file.mimetype);

        return {
            message: 'File retrieved successfully',
            data: StorageFileV1Response.FromEntity(file, fileUrl),
        };
    }

    @Delete('/:id')
    @ExcludeGlobalGuard()
    async deleteFile(@Param('id') id: string): Promise<IBasicResponse<null>> {
        await this.storageFileService.deleteFile(id);

        return {
            message: 'File deleted successfully',
            data: null,
        };
    }
}
