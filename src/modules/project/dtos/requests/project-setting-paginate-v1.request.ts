import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';
import { ProjectSettingKeyEnum } from '../../shared/enums/project-setting-key.enum';

export const ProjectSettingPaginateV1Schema = PaginateSchema.extend({
    key: z.nativeEnum(ProjectSettingKeyEnum).optional(),
});

export class ProjectSettingPaginateV1Request extends ZodUtils.createCamelCaseDto(
    ProjectSettingPaginateV1Schema,
) {}
