import { IPermission } from 'src/infrastructures/databases/entities/interfaces/permission.interface';
import { OperationV1Response } from 'src/modules/operation/dtos/responses/operation-v1.response';
import { ResourceV1Response } from 'src/modules/resource/dtos/responses/resource-v1.response';

export class PermissionV1Response {
    id: string;
    name: string;
    slug: string;
    description?: string;
    resource?: ResourceV1Response;
    operation?: OperationV1Response;

    static FromEntity(data: IPermission): PermissionV1Response {
        const response = new PermissionV1Response();
        response.id = data.id;
        response.name = data.name;
        response.slug = data.slug;
        response.description = data.description;

        if (data.resource) {
            response.resource = ResourceV1Response.FromEntity(data.resource);
        }

        if (data.operation) {
            response.operation = OperationV1Response.FromEntity(data.operation);
        }

        return response;
    }

    static MapEntities(data: IPermission[]): PermissionV1Response[] {
        return data.map((permission) => this.FromEntity(permission));
    }
}
