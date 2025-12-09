import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';
import { ProjectSettingKeyEnum } from '../../shared/enums/project-setting-key.enum';

export const ProjectSettingCreateV1Schema = z.object({
    key: z.nativeEnum(ProjectSettingKeyEnum),
    values: z.any(),
});

export class ProjectSettingCreateV1Request extends ZodUtils.createCamelCaseDto(
    ProjectSettingCreateV1Schema,
) {}
