import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IPlatform } from './interfaces/platform.interface';

@Entity({
    name: 'platforms',
})
export class Platform extends BaseEntity implements IPlatform {
    @Column()
    framework: string;

    @Column()
    ormProvider: string;

    @Column()
    databaseProvider: string;
}
