import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IOperation } from './interfaces/operation.interface';
import { IPermission } from './interfaces/permission.interface';
import { IResource } from './interfaces/resource.interface';
import { IRole } from './interfaces/role.interface';
import { Operation } from './operation.entity';
import { Resource } from './resource.entity';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission extends BaseEntity implements IPermission {
    @Column()
    slug: string;

    @Column()
    name: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    description?: string;

    @ManyToOne(() => Resource, { nullable: true })
    resource?: IResource;

    @ManyToOne(() => Operation, { nullable: true })
    operation?: IOperation;

    @ManyToMany(() => Role)
    @JoinTable({ name: 'role_permissions' })
    roles?: IRole[];
}
