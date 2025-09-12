import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';
import { ProjectStatusEnum } from '../../shared/enums/project-status.enum';

export const ProjectCreateV1Schema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    status: z
        .nativeEnum(ProjectStatusEnum)
        .optional()
        .default(ProjectStatusEnum.ACTIVE),
    platformId: z
        .string({
            required_error: 'Platform ID is required',
        })
        .uuid(),
});

export const ProjectDeleteByIdsV1Schema = z.object({
    ids: z.array(z.string()),
});

export const ProjectUpdateV1Schema = ProjectCreateV1Schema;

export class ProjectCreateV1Request extends ZodUtils.createCamelCaseDto(
    ProjectCreateV1Schema,
) {}

export class ProjectUpdateV1Request extends ZodUtils.createCamelCaseDto(
    ProjectUpdateV1Schema,
) {}

export class ProjectDeleteByIdsV1Request extends ZodUtils.createCamelCaseDto(
    ProjectDeleteByIdsV1Schema,
) {}
