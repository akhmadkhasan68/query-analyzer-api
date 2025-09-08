import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IProjectKey } from 'src/infrastructures/databases/entities/interfaces/project-key.interface';

export const ProjectKey = createParamDecorator(
    async (data, ctx: ExecutionContext): Promise<IProjectKey> => {
        return ctx.switchToHttp().getRequest().projectKey;
    },
);
