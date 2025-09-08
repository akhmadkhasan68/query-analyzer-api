import { IResource } from 'src/infrastructures/databases/entities/interfaces/resource.interface';

export class ResourceV1Response {
    id: string;
    slug: string;
    name: string;
    description?: string;

    static FromEntity(data: IResource): ResourceV1Response {
        return {
            id: data.id,
            name: data.name,
            slug: data.slug,
            description: data.description,
        };
    }

    static MapEntities(data: IResource[]): ResourceV1Response[] {
        return data.map((resource) => this.FromEntity(resource));
    }
}
