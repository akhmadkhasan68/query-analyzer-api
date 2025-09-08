import { IProjectKey } from 'src/infrastructures/databases/entities/interfaces/project-key.interface';

export class ProjectKeyV1Response {
    id: string;
    name: string;
    hashedKey: string;
    maskedKey: string;
    plainKey?: string;
    lastUsedAt: Date | null;

    static FromEntity(entity: IProjectKey): ProjectKeyV1Response {
        const response = new ProjectKeyV1Response();

        response.id = entity.id;
        response.name = entity.name;
        response.hashedKey = entity.hashedKey;
        response.maskedKey = entity.maskedKey;
        response.lastUsedAt = entity.lastUsedAt || null;

        if ((entity as any).plainKey) {
            response.plainKey = (entity as any).plainKey;
        }

        return response;
    }

    static MapEntities(entities: IProjectKey[]): ProjectKeyV1Response[] {
        return entities.map((entity) => this.FromEntity(entity));
    }
}
