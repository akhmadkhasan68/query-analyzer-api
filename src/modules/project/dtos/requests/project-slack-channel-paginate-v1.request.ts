import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';

export const ProjectSlackChannelPaginateV1Schema = PaginateSchema.extend({});

export class ProjectSlackChannelPaginateV1Request extends ZodUtils.createCamelCaseDto(
    ProjectSlackChannelPaginateV1Schema,
) {}
