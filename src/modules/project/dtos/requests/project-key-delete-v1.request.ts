import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const ProjectKeyDeleteV1Schema = z.object({
    ids: z.array(z.string().uuid(), {
        required_error: 'Project Key Ids are required',
    }),
});

export class ProjectKeyDeleteV1Request extends ZodUtils.createCamelCaseDto(
    ProjectKeyDeleteV1Schema,
) {}
