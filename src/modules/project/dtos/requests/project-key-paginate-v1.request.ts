import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';

export const ProjectKeyPaginateV1Schema = PaginateSchema.extend({});

export class ProjectKeyPaginateV1Request extends ZodUtils.createCamelCaseDto(
    ProjectKeyPaginateV1Schema,
) {}
