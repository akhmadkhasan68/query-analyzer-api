// permission.guard.ts
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IUser } from 'src/infrastructures/databases/entities/interfaces/user.interface';
import {
    TOperation,
    TResource,
} from 'src/shared/constants/permission.constant';
import { PermissionUtil } from 'src/shared/utils/permission.util';
import { PERMISSION_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const permission = this.reflector.get<{
            group: TResource;
            actions: TOperation[];
        }>(PERMISSION_KEY, context.getHandler());

        if (!permission) return true; // No permission required

        const request = context.switchToHttp().getRequest();
        const user = request.user as IUser;

        const userPermissions =
            user.roles?.flatMap((role) => role.permissions ?? []) || [];

        if (!user || !userPermissions) {
            throw new ForbiddenException('No permissions found.');
        }

        const userPermissionSlugs: string[] =
            PermissionUtil.getPermissionSlugsByEntities(userPermissions);

        const { group, actions } = permission;

        const hasAllPermissions = actions.every((action) =>
            userPermissionSlugs.includes(
                PermissionUtil.getPermissionSlugByResourceAndOperation(
                    group,
                    action,
                ),
            ),
        );

        if (!hasAllPermissions) {
            throw new ForbiddenException('Insufficient permissions.');
        }

        return true;
    }
}
