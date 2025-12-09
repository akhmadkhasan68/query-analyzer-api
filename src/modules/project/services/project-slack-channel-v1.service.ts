import {
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { IProjectSlackChannel } from 'src/infrastructures/databases/entities/interfaces/project-slack-channel.interface';
import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { In } from 'typeorm';
import { ProjectSlackChannelCreateV1Request } from '../dtos/requests/project-slack-channel-create-v1.request';
import { ProjectSlackChannelPaginateV1Request } from '../dtos/requests/project-slack-channel-paginate-v1.request';
import { ProjectSlackChannelV1Repository } from '../repositories/project-slack-channel-v1.repository';
import { ProjectV1Repository } from '../repositories/project-v1.repository';

@Injectable()
export class ProjectSlackChannelV1Service {
    constructor(
        private readonly projectSlackChannelRepository: ProjectSlackChannelV1Repository,
        private readonly projectRepository: ProjectV1Repository,
    ) {}

    async paginate(
        projectId: string,
        paginationDto: ProjectSlackChannelPaginateV1Request,
    ): Promise<IPaginateData<IProjectSlackChannel>> {
        return await this.projectSlackChannelRepository.paginate(
            projectId,
            paginationDto,
        );
    }

    async findByIds(ids: string[]): Promise<IProjectSlackChannel[]> {
        const data = await this.projectSlackChannelRepository.find({
            where: {
                id: In(ids),
            },
        });

        if (data.length !== ids.length) {
            throw new NotFoundException(ERROR_MESSAGE_CONSTANT.NotFound);
        }

        return data;
    }

    async create(
        projectId: string,
        dto: ProjectSlackChannelCreateV1Request,
    ): Promise<IProjectSlackChannel> {
        const projectDetail =
            await this.projectRepository.findOneByIdOrFail(projectId);

        // Validate uniqueness of slackChannelId within the project
        const existingChannel =
            await this.projectSlackChannelRepository.findOne({
                where: {
                    slackChannelId: dto.slackChannelId,
                    project: { id: projectId },
                },
            });

        if (existingChannel) {
            throw new UnprocessableEntityException(
                ERROR_MESSAGE_CONSTANT.FieldDuplicate('Slack Channel ID'),
            );
        }

        const entity = this.projectSlackChannelRepository.create({
            slackChannelId: dto.slackChannelId,
            project: { id: projectDetail.id },
        });

        const createdEntity =
            await this.projectSlackChannelRepository.save(entity);
        createdEntity.project = projectDetail;

        return createdEntity;
    }

    async delete(id: string | string[]): Promise<void> {
        await this.projectSlackChannelRepository.softDelete(id);
    }
}
