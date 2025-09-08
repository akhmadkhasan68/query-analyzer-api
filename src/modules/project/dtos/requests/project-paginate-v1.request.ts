import { PaginateSchema } from 'src/shared/dtos/requests/paginate.request';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';
import { ProjectStatusEnum } from '../../shared/enums/project-status.enum';

export const ProjectPaginateV1Schema = PaginateSchema.extend({
    status: z.nativeEnum(ProjectStatusEnum).optional(),
});

export class ProjectPaginateV1Request extends ZodUtils.createCamelCaseDto(
    ProjectPaginateV1Schema,
) {}
