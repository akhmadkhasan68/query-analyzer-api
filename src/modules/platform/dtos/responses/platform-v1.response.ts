import { IPlatform } from 'src/infrastructures/databases/entities/interfaces/platform.interface';

export class PlatformV1Response {
    id: string;
    framework: string;
    ormProvider: string;
    databaseProvider: string;

    static FromEntity(entity: IPlatform): PlatformV1Response {
        return {
            id: entity.id,
            framework: entity.framework,
            ormProvider: entity.ormProvider,
            databaseProvider: entity.databaseProvider,
        };
    }

    static MapEntities(entities: IPlatform[]): PlatformV1Response[] {
        return entities.map((entity) => this.FromEntity(entity));
    }
}
