import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const SlackInteractivePayloadV1Schema = z.object({
    payload: z.string(),
});

export class SlackInteractivePayloadV1Request extends ZodUtils.createCamelCaseDto(
    SlackInteractivePayloadV1Schema,
) {}
