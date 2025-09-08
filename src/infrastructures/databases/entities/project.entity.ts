import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ProjectStatusEnum } from '../../../modules/project/shared/enums/project-status.enum';
import { BaseEntity } from './base.entity';
import { IPlatform } from './interfaces/platform.interface';
import { IProjectKey } from './interfaces/project-key.interface';
import { IProject } from './interfaces/project.interface';
import { Platform } from './platform.entity';
import { ProjectKey } from './project-key.entity';

@Entity('projects')
export class Project extends BaseEntity implements IProject {
    @Column()
    name: string;

    @Column({ nullable: true })
    description?: string;

    @Column({
        default: ProjectStatusEnum.ACTIVE,
    })
    status: ProjectStatusEnum;

    @ManyToOne(() => Platform)
    platform?: IPlatform;

    @OneToMany(() => ProjectKey, (projectKey) => projectKey.project)
    projectKeys?: IProjectKey[];
}
