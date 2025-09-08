import { IOperation } from 'src/infrastructures/databases/entities/interfaces/operation.interface';

export class OperationV1Response {
    id: string;
    slug: string;
    name: string;

    static FromEntity(data: IOperation): OperationV1Response {
        return {
            id: data.id,
            name: data.name,
            slug: data.slug,
        };
    }

    static MapEntities(data: IOperation[]): OperationV1Response[] {
        return data.map((operation) => this.FromEntity(operation));
    }
}
