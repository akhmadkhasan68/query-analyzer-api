import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPlatform } from 'src/infrastructures/databases/entities/interfaces/platform.interface';
import { Platform } from 'src/infrastructures/databases/entities/platform.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlatformV1Repository extends Repository<IPlatform> {
    constructor(
        @InjectRepository(Platform)
        private readonly platformRepository: Repository<IPlatform>,
    ) {
        super(
            platformRepository.target,
            platformRepository.manager,
            platformRepository.queryRunner,
        );
    }

    async findOneByIdOrFail(id: string): Promise<IPlatform> {
        return await this.platformRepository.findOneByOrFail({ id });
    }
}
