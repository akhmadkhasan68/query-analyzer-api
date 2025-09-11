import { IProject } from 'src/infrastructures/databases/entities/interfaces/project.interface';
import { PlatformV1Response } from 'src/modules/platform/dtos/responses/platform-v1.response';
import { ProjectKeyV1Response } from './project-key-v1.response';

export class ProjectV1Response {
    id: string;
    name: string;
    description: string | null;
    status: string;
    gitlabProjectId: number | null;

    platform?: PlatformV1Response;
    keys?: ProjectKeyV1Response[];

    static FromEntity(entity: IProject): ProjectV1Response {
        const response = new ProjectV1Response();

        response.id = entity.id;
        response.name = entity.name;
        response.description = entity.description || null;
        response.status = entity.status.toString();
        response.gitlabProjectId = entity.gitlabProjectId || null;

        if (entity.platform) {
            response.platform = PlatformV1Response.FromEntity(entity.platform);
        }

        if (entity.projectKeys) {
            response.keys = ProjectKeyV1Response.MapEntities(
                entity.projectKeys,
            );
        }

        return response;
    }

    static MapEntities(entities: IProject[]): ProjectV1Response[] {
        return entities.map((entity) => this.FromEntity(entity));
    }
}
