import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const ProjectKeyCreateV1Schema = z.object({
    projectId: z
        .string({
            required_error: 'Project ID is required',
        })
        .uuid(),
    name: z.string().min(2).max(100),
});

export class ProjectKeyCreateV1Request extends ZodUtils.createCamelCaseDto(
    ProjectKeyCreateV1Schema,
) {}
