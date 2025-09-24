import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IProjectGitlab } from './interfaces/project-gitlab.interface';
import { IProject } from './interfaces/project.interface';
import { Project } from './project.entity';

@Entity('project_gitlabs')
export class ProjectGitlab extends BaseEntity implements IProjectGitlab {
    @Column({
        type: 'uuid',
    })
    projectId: string;

    @Column({ type: 'bigint' })
    gitlabProjectId: number;

    @Column()
    gitlabUrl: string;

    @Column({ type: 'bigint' })
    gitlabGroupId: number;

    @Column()
    gitlabGroupName: string;

    @Column()
    gitlabDefaultBranch: string;

    @Column()
    gitlabVisibility: string;

    @OneToOne(() => Project)
    @JoinColumn({
        name: 'project_id',
    })
    project?: IProject;
}
