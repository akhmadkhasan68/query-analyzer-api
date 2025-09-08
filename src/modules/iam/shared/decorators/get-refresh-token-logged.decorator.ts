import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from 'src/infrastructures/databases/entities/interfaces/user.interface';

export const GetRefreshTokenLogged = createParamDecorator(
    async (data, ctx: ExecutionContext): Promise<IUser> => {
        return ctx.switchToHttp().getRequest().user;
    },
);
