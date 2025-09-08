import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permission } from 'src/modules/iam/shared/decorators/permission.decorator';
import { JwtAuthTypeEnum } from 'src/modules/iam/shared/enums/token-type.enum';
import { OPERATION, RESOURCE } from 'src/shared/constants/permission.constant';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { IPaginationResponse } from 'src/shared/interfaces/paginate-response.interface';
import { OperationPaginateV1Request } from '../dtos/requests/operation-paginate-v1.request';
import { OperationV1Response } from '../dtos/responses/operation-v1.response';
import { OperationV1Service } from '../services/operation-v1.service';

@Controller({
    path: 'operations',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class OperationV1Controller {
    constructor(private readonly operationV1Service: OperationV1Service) {}

    @Permission(RESOURCE.PERMISSION, [OPERATION.VIEW])
    @Get()
    async paginate(
        @Query() paginationDto: OperationPaginateV1Request,
    ): Promise<IPaginationResponse<OperationV1Response>> {
        const result = await this.operationV1Service.paginate(paginationDto);

        return {
            data: {
                meta: result.meta,
                items: OperationV1Response.MapEntities(result.items),
            },

            message: 'Operation pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.PERMISSION, [OPERATION.VIEW])
    @Get(':id')
    async findOne(
        @Param('id') id: string,
    ): Promise<IBasicResponse<OperationV1Response>> {
        const result = await this.operationV1Service.findOneById(id);

        return {
            data: OperationV1Response.FromEntity(result),
            message: 'Operation retrieved successfully',
        };
    }
}
