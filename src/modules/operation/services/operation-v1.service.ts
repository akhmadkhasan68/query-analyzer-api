import { Injectable } from '@nestjs/common';
import { IOperation } from 'src/infrastructures/databases/entities/interfaces/operation.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { OperationPaginateV1Request } from '../dtos/requests/operation-paginate-v1.request';
import { OperationV1Repository } from '../repositories/operation-v1.repository';

@Injectable()
export class OperationV1Service {
    constructor(private readonly operationRepository: OperationV1Repository) {}

    async paginate(
        paginationDto: OperationPaginateV1Request,
    ): Promise<IPaginateData<IOperation>> {
        return this.operationRepository.pagination(paginationDto);
    }

    async findOneById(id: string): Promise<IOperation> {
        return this.operationRepository.findOneByIdOrFail(id);
    }
}
