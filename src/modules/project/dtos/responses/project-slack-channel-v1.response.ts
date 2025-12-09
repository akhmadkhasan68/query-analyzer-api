import { IProjectSlackChannel } from 'src/infrastructures/databases/entities/interfaces/project-slack-channel.interface';
import { ProjectV1Response } from './project-v1.response';

export class ProjectSlackChannelV1Response {
    id: string;
    project: ProjectV1Response;
    slackChannelId: string;

    static FromEntity(
        entity: IProjectSlackChannel,
    ): ProjectSlackChannelV1Response {
        const response = new ProjectSlackChannelV1Response();
        response.id = entity.id;

        if (entity.project) {
            response.project = ProjectV1Response.FromEntity(entity.project);
        }

        response.slackChannelId = entity.slackChannelId;

        return response;
    }

    static MapEntities(
        entities: IProjectSlackChannel[],
    ): ProjectSlackChannelV1Response[] {
        return entities.map((entity) => this.FromEntity(entity));
    }
}
