import { IProjectKey } from 'src/infrastructures/databases/entities/interfaces/project-key.interface';

export class ProjectKeyV1Response {
    id: string;
    name: string;
    maskedKey: string;
    plainKey?: string;
    lastUsedAt?: Date;

    static FromEntity(entity: IProjectKey): ProjectKeyV1Response {
        const response = new ProjectKeyV1Response();

        response.id = entity.id;
        response.name = entity.name;
        response.maskedKey = entity.maskedKey;

        if ((entity as any).plainKey) {
            response.plainKey = (entity as any).plainKey;
        }

        if (entity.lastUsedAt) {
            response.lastUsedAt = entity.lastUsedAt;
        }

        return response;
    }

    static MapEntities(entities: IProjectKey[]): ProjectKeyV1Response[] {
        return entities.map((entity) => this.FromEntity(entity));
    }
}
