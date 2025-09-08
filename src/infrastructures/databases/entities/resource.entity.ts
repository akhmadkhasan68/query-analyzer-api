import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IResource } from './interfaces/resource.interface';

@Entity('resources')
export class Resource extends BaseEntity implements IResource {
    @Column({
        type: 'varchar',
        length: 255,
        unique: true,
    })
    slug: string;

    @Column({
        type: 'varchar',
        length: 255,
    })
    name: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    description?: string;
}
