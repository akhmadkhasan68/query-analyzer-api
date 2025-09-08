import { IUser } from 'src/infrastructures/databases/entities/interfaces/user.interface';
import { RoleV1Response } from '../../../role/dtos/responses/role-v1.response';

export class UserV1Response {
    id: string;
    fullname: string;
    email: string;
    phoneNumber: string;

    roles?: RoleV1Response[];

    static FromEntity(entity: IUser): UserV1Response {
        return {
            id: entity.id,
            fullname: entity.fullname,
            email: entity.email,
            phoneNumber: entity.phoneNumber,
            roles: entity.roles ? RoleV1Response.MapEntities(entity.roles) : [],
        };
    }

    static MapEntities(entities: IUser[]): UserV1Response[] {
        return entities.map((entity) => this.FromEntity(entity));
    }
}
