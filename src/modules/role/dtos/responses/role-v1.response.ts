import { IRole } from 'src/infrastructures/databases/entities/interfaces/role.interface';
import { PermissionV1Response } from '../../../permission/dtos/responses/permission-v1.response';

export class RoleV1Response {
    id: string;
    name: string;
    slug: string;
    permissions?: PermissionV1Response[];

    static fromEntity(data: IRole): RoleV1Response {
        return {
            id: data.id,
            name: data.name,
            slug: data.slug,
            permissions: data.permissions
                ? PermissionV1Response.MapEntities(data.permissions)
                : [],
        };
    }

    static MapEntities(data: IRole[]): RoleV1Response[] {
        return data.map((role) => this.fromEntity(role));
    }
}
