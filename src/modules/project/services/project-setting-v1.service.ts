import { Injectable, NotFoundException } from '@nestjs/common';
import { IProjectSetting } from 'src/infrastructures/databases/entities/interfaces/project-setting.interface';
import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { In } from 'typeorm';
import { ProjectSettingCreateV1Request } from '../dtos/requests/project-setting-create-v1.request';
import { ProjectSettingPaginateV1Request } from '../dtos/requests/project-setting-paginate-v1.request';
import { ProjectSettingV1Repository } from '../repositories/project-setting-v1.repository';

@Injectable()
export class ProjectSettingV1Service {
    constructor(
        private readonly projectSettingRepository: ProjectSettingV1Repository,
    ) {}

    async paginate(
        projectId: string,
        paginationDto: ProjectSettingPaginateV1Request,
    ): Promise<IPaginateData<IProjectSetting>> {
        return await this.projectSettingRepository.paginate(
            projectId,
            paginationDto,
        );
    }

    async findByIds(ids: string[]): Promise<IProjectSetting[]> {
        const data = await this.projectSettingRepository.find({
            where: {
                id: In(ids),
            },
        });

        if (data.length !== ids.length) {
            throw new NotFoundException(ERROR_MESSAGE_CONSTANT.NotFound);
        }

        return data;
    }

    async createOrUpdate(
        projectId: string,
        payload: ProjectSettingCreateV1Request,
    ): Promise<IProjectSetting> {
        // check if setting with the same key already exists for the project
        const existingSetting = await this.projectSettingRepository.findOne({
            where: {
                projectId,
                key: payload.key,
            },
        });

        if (existingSetting) {
            // update the existing setting
            existingSetting.values = JSON.stringify(payload.values);

            return await this.projectSettingRepository.save(existingSetting);
        }

        const newSetting = this.projectSettingRepository.create({
            projectId,
            key: payload.key,
            values: JSON.stringify(payload.values),
        });

        return await this.projectSettingRepository.save(newSetting);
    }

    async delete(id: string | string[]): Promise<void> {
        await this.projectSettingRepository.delete(id);
    }
}
