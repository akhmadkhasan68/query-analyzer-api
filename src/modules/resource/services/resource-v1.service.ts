import { Injectable } from '@nestjs/common';
import { IResource } from 'src/infrastructures/databases/entities/interfaces/resource.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { ResourcePaginateV1Request } from '../dtos/requests/resource-paginate-v1.request';
import { ResourceV1Repository } from '../repositories/resource-v1.repository';

@Injectable()
export class ResourceV1Service {
    constructor(private readonly resourceRepository: ResourceV1Repository) {}

    async paginate(
        paginationDto: ResourcePaginateV1Request,
    ): Promise<IPaginateData<IResource>> {
        return this.resourceRepository.pagination(paginationDto);
    }

    async findOneById(id: string): Promise<IResource> {
        return this.resourceRepository.findOneByIdOrFail(id);
    }
}
