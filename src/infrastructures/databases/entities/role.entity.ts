import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IPermission } from './interfaces/permission.interface';
import { IRole } from './interfaces/role.interface';
import { IUser } from './interfaces/user.interface';
import { Permission } from './permission.entity';
import { User } from './user.entity';

@Entity('roles')
export class Role extends BaseEntity implements IRole {
    @Column({
        unique: true,
    })
    slug: string;

    @Column()
    name: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    description?: string;

    @ManyToMany(() => Permission)
    @JoinTable({ name: 'role_permissions' })
    permissions?: IPermission[];

    @ManyToMany(() => User)
    @JoinTable({ name: 'user_roles' })
    users?: IUser[];
}
