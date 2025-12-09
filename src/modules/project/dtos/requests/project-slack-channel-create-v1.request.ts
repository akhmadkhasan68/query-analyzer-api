import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const ProjectSlackChannelCreateV1Schema = z.object({
    slackChannelId: z.string().min(2).max(100),
});

export class ProjectSlackChannelCreateV1Request extends ZodUtils.createCamelCaseDto(
    ProjectSlackChannelCreateV1Schema,
) {}
