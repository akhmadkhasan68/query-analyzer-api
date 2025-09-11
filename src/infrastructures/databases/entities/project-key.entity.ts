import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IProjectKey } from './interfaces/project-key.interface';
import { IProject } from './interfaces/project.interface';
import { Project } from './project.entity';

@Entity({
    name: 'project_keys',
})
export class ProjectKey extends BaseEntity implements IProjectKey {
    @Column()
    projectId: string;

    @Column()
    name: string;

    @Column()
    hashedKey: string;

    @Column()
    maskedKey: string;

    @Column({
        default: () => 'CURRENT_TIMESTAMP',
        type: 'timestamp with time zone',
    })
    lastUsedAt: Date;

    @ManyToOne(() => Project)
    project?: IProject;
}
