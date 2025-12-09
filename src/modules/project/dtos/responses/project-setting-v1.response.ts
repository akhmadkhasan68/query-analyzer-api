import { IProjectSetting } from 'src/infrastructures/databases/entities/interfaces/project-setting.interface';
import { ProjectV1Response } from './project-v1.response';

export class ProjectSettingV1Response {
    id: string;
    project: ProjectV1Response;
    key: string;
    values: string;

    static FromEntity(entity: IProjectSetting): ProjectSettingV1Response {
        const response = new ProjectSettingV1Response();
        response.id = entity.id;

        if (entity.project) {
            response.project = ProjectV1Response.FromEntity(entity.project);
        }

        response.key = entity.key;
        response.values = JSON.parse(entity.values);

        return response;
    }

    static MapEntities(
        entities: IProjectSetting[],
    ): ProjectSettingV1Response[] {
        return entities.map((entity) => this.FromEntity(entity));
    }
}
