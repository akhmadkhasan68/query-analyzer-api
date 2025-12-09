import { DeleteByIdsSchema } from 'src/shared/dtos/requests/delete-by-ids.request';
import { ZodUtils } from 'src/shared/utils/zod.util';

export const ProjectSettingDeleteV1Schema = DeleteByIdsSchema.extend({});

export class ProjectSettingDeleteV1Request extends ZodUtils.createCamelCaseDto(
    ProjectSettingDeleteV1Schema,
) {}
