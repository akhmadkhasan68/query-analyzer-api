import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';

export const GitlabProjectPaginateV1Schema = PaginateSchema.extend({});

export class GitlabProjectPaginateV1Request extends ZodUtils.createCamelCaseDto(
    GitlabProjectPaginateV1Schema,
) {}
