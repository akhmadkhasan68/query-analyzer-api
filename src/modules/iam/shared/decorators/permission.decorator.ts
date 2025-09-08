import { SetMetadata } from '@nestjs/common';
import type {
    TOperation,
    TResource,
} from 'src/shared/constants/permission.constant';

export const PERMISSION_KEY = 'permission';

export const Permission = (group: TResource, actions: TOperation[]) =>
    SetMetadata(PERMISSION_KEY, { group, actions });
