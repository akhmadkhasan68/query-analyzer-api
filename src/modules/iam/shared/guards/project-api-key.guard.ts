// permission.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ProjectKeyV1Service } from 'src/modules/project/services/project-key-v1.service';

@Injectable()
export class ProjectApiKeyGuard implements CanActivate {
    constructor(private readonly projectKeyV1Service: ProjectKeyV1Service) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const requestHeaders = request.headers as Record<string, string>;
        const xProjectIdHeader =
            requestHeaders['x-project-id'] || requestHeaders['X-PROJECT-ID'];

        const apiKey = this.extractApiKeyFromHeaders(requestHeaders);

        if (!xProjectIdHeader || !apiKey) {
            return false;
        }

        // Check if the API key exists in the database
        const projectKey = await this.projectKeyV1Service.validateKeyPlain(
            apiKey,
            xProjectIdHeader,
        );

        if (!projectKey) {
            return false;
        }

        // Attach projectKey to request for further use in the request lifecycle
        request.projectKey = projectKey;

        return true;
    }

    private extractApiKeyFromHeaders(
        headers: Record<string, string>,
    ): string | null {
        const xApiKeyHeader = headers['x-api-key'] || headers['X-API-KEY']; // Extract x-api-key header
        const authorization =
            headers['authorization'] || headers['Authorization']; // Or extract Authorization header

        // 1. Check for x-api-key header first
        if (xApiKeyHeader && typeof xApiKeyHeader === 'string') {
            return xApiKeyHeader;
        }

        // 2. Then check for Bearer token in Authorization header
        if (
            authorization &&
            typeof authorization === 'string' &&
            authorization.startsWith('Bearer ')
        ) {
            const token = authorization.split(' ')[1];
            if (token && token.trim() !== '') {
                return token;
            }
        }

        // If no API key found, return null
        return null;
    }
}
