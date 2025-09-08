import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const IS_EXCLUDE_GLOBAL_GUARD_KEY = 'isExcludeGlobalGuard';
export const ExcludeGlobalGuard = () =>
    SetMetadata(IS_EXCLUDE_GLOBAL_GUARD_KEY, true);
