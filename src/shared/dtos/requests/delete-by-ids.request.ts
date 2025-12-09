import { z } from 'zod';
import { ZodUtils } from '../../utils/zod.util';

export const DeleteByIdsSchema = z.object({
    ids: z.array(z.string().uuid(), {
        required_error: 'Ids are required',
    }),
});

export class DeleteByIdsRequest extends ZodUtils.createCamelCaseDto(
    DeleteByIdsSchema,
) {}
