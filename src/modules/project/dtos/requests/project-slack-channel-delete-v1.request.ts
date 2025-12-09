import { DeleteByIdsSchema } from 'src/shared/dtos/requests/delete-by-ids.request';
import { ZodUtils } from 'src/shared/utils/zod.util';

export const ProjectSlackChannelDeleteV1Schema = DeleteByIdsSchema.extend({});

export class ProjectSlackChannelDeleteV1Request extends ZodUtils.createCamelCaseDto(
    ProjectSlackChannelDeleteV1Schema,
) {}
