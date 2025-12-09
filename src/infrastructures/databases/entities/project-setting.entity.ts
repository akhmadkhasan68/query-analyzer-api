import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { ProjectSettingKeyEnum } from '../../../modules/project/shared/enums/project-setting-key.enum';
import { BaseEntity } from './base.entity';
import { IProjectSetting } from './interfaces/project-setting.interface';
import { IProject } from './interfaces/project.interface';
import { Project } from './project.entity';

@Entity('project_settings')
export class ProjectSetting extends BaseEntity implements IProjectSetting {
    @Column()
    projectId: string;

    @Column({
        type: 'varchar',
        enum: ProjectSettingKeyEnum,
    })
    key: ProjectSettingKeyEnum;

    @Column({
        type: 'jsonb',
    })
    values: string;

    @OneToOne(() => Project)
    @JoinColumn({
        name: 'project_id',
    })
    project?: IProject | undefined;
}
