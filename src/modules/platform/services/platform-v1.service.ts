import {
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { IPlatform } from 'src/infrastructures/databases/entities/interfaces/platform.interface';
import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { DataSource } from 'typeorm';
import {
    PlatformCreateV1Request,
    PlatformUpdateV1Request,
} from '../dtos/requests/platform-create-v1.request';
import { PlatformPaginateV1Request } from '../dtos/requests/platform-paginate-v1.request';
import { PlatformV1Repository } from '../repositories/platform-v1.repository';

@Injectable()
export class PlatformV1Service {
    constructor(
        private readonly platformV1Repository: PlatformV1Repository,
        private readonly dataSource: DataSource,
    ) {}

    private async validateDuplicatePlatform(
        framework: string,
        ormProvider: string,
        databaseProvider: string,
    ): Promise<void> {
        const existingPlatform =
            await this.platformV1Repository.findByFrameworkAndProvider(
                framework,
                ormProvider,
                databaseProvider,
            );

        if (existingPlatform) {
            throw new UnprocessableEntityException(
                `Platform with framework ${framework}, orm provider ${ormProvider} and database provider ${databaseProvider} already exists`,
            );
        }
    }

    async paginate(
        paginationDto: PlatformPaginateV1Request,
    ): Promise<IPaginateData<IPlatform>> {
        return this.platformV1Repository.paginate(paginationDto);
    }

    async detail(id: string): Promise<IPlatform> {
        const platform = await this.platformV1Repository.findOneById(id);

        if (!platform) {
            throw new NotFoundException(ERROR_MESSAGE_CONSTANT.NotFound);
        }

        return platform;
    }

    private async createPlatformWithTransaction(
        platform: IPlatform,
    ): Promise<IPlatform> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const createdPlatform =
                await this.platformV1Repository.saveWithTransaction(
                    queryRunner,
                    platform,
                );

            await queryRunner.commitTransaction();

            return createdPlatform;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async create(dto: PlatformCreateV1Request): Promise<IPlatform> {
        await this.validateDuplicatePlatform(
            dto.framework,
            dto.ormProvider,
            dto.databaseProvider,
        );

        const platform = this.platformV1Repository.create({
            ...dto,
        });

        return this.createPlatformWithTransaction(platform);
    }

    async update(id: string, dto: PlatformUpdateV1Request): Promise<void> {
        await this.validateDuplicatePlatform(
            dto.framework,
            dto.ormProvider,
            dto.databaseProvider,
        );

        const platform = await this.platformV1Repository.findOneById(id);

        if (!platform) {
            throw new NotFoundException(ERROR_MESSAGE_CONSTANT.NotFound);
        }

        await this.platformV1Repository.update(platform.id, {
            ...dto,
        });
    }

    async deleteByIds(ids: string[]): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        for (let i = 0; i < ids.length; i++) {
            const project = await this.platformV1Repository.findOneById(ids[i]);

            if (!project) {
                throw new NotFoundException(
                    `Platform with id ${ids[i]} ${ERROR_MESSAGE_CONSTANT.NotFound}`,
                );
            }
        }

        try {
            await this.platformV1Repository.deleteByIdsWithTransaction(
                queryRunner,
                ids,
            );

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
