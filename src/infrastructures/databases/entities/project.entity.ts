import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { ProjectStatusEnum } from '../../../modules/project/shared/enums/project-status.enum';
import { BaseEntity } from './base.entity';
import { IPlatform } from './interfaces/platform.interface';
import { IProjectGitlab } from './interfaces/project-gitlab.interface';
import { IProjectKey } from './interfaces/project-key.interface';
import { IProjectSlackChannel } from './interfaces/project-slack-channel.interface';
import { IProject } from './interfaces/project.interface';
import { Platform } from './platform.entity';
import { ProjectGitlab } from './project-gitlab.entity';
import { ProjectKey } from './project-key.entity';
import { ProjectSlackChannel } from './project-slack-channel.entity';

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

    @OneToOne(() => ProjectGitlab, (projectGitlab) => projectGitlab.project)
    projectGitlab?: IProjectGitlab;

    @OneToMany(
        () => ProjectSlackChannel,
        (projectSlackChannel) => projectSlackChannel.project,
    )
    projectSlackChannels?: IProjectSlackChannel[];
}
