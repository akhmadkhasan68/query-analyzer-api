import { ProjectSettingKeyEnum } from 'src/modules/project/shared/enums/project-setting-key.enum';
import { IBaseEntity } from './base-entity.interface';
import { IProject } from './project.interface';

export interface IProjectSetting extends IBaseEntity {
    projectId: string;
    key: ProjectSettingKeyEnum;
    values: string;
    project?: IProject;
}
