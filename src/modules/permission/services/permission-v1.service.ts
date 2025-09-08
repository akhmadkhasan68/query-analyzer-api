import { Injectable } from '@nestjs/common';
import { IPermission } from 'src/infrastructures/databases/entities/interfaces/permission.interface';
import { EXPORT_DATA_STRATEGY } from 'src/infrastructures/modules/export-data/constants/export-data-strategy.constant';
import { ExportDataFactoryService } from 'src/infrastructures/modules/export-data/services/export-data-factory.service';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { PermissionPaginateV1Request } from '../dtos/requests/permission-paginate-v1.request';
import { PermissionV1Response } from '../dtos/responses/permission-v1.response';
import { PermissionV1Repository } from '../repositories/permission-v1.repository';

@Injectable()
export class PermissionV1Service {
    constructor(
        private readonly permissionV1Repository: PermissionV1Repository,
        private readonly exportDataFactoryService: ExportDataFactoryService,
    ) {}

    async paginate(
        paginationDto: PermissionPaginateV1Request,
    ): Promise<IPaginateData<IPermission>> {
        return await this.permissionV1Repository.pagination(paginationDto);
    }

    async findOneById(id: string): Promise<IPermission> {
        return await this.permissionV1Repository.findOrFailByIdWithRelations(
            id,
        );
    }

    async generatePdf(permissions: PermissionV1Response[]): Promise<Buffer> {
        return await this.exportDataFactoryService
            .exportStrategy(EXPORT_DATA_STRATEGY.PDF)
            .export(permissions, {
                isCustomTemplate: false,
                template: 'table',
                options: {
                    pageSize: 'A4',
                    orientation: 'Portrait',
                    marginTop: '10mm',
                    marginBottom: '10mm',
                    marginLeft: '10mm',
                    marginRight: '10mm',
                },
            });
    }
}
