import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IProjectSlackChannel } from './interfaces/project-slack-channel.interface';
import { IProject } from './interfaces/project.interface';
import { Project } from './project.entity';

@Entity('project_slack_channels')
export class ProjectSlackChannel
    extends BaseEntity
    implements IProjectSlackChannel
{
    @Column({
        type: 'uuid',
    })
    projectId: string;

    @Column()
    slackChannelId: string;

    @ManyToOne(() => Project)
    @JoinColumn({
        name: 'project_id',
    })
    project?: IProject | undefined;
}
