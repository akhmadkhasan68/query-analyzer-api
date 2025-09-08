import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IOperation } from './interfaces/operation.interface';

@Entity('operations')
export class Operation extends BaseEntity implements IOperation {
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
}
