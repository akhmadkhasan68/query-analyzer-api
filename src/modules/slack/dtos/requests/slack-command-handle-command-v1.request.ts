import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const SlackCommandHandleCommandV1Schema = z.object({
    token: z.string(),
    teamId: z.string(),
    teamDomain: z.string(),
    channelId: z.string(),
    channelName: z.string(),
    userId: z.string(),
    userName: z.string(),
    command: z.string(),
    text: z.string().optional(),
    apiAppId: z.string(),
    isEnterpriseInstall: z.string().optional(),
    responseUrl: z.string().url(),
    triggerId: z.string(),
});

export class SlackCommandHandleCommandV1Request extends ZodUtils.createCamelCaseDto(
    SlackCommandHandleCommandV1Schema,
) {}
