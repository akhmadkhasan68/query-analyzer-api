import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    HttpHealthIndicator,
    TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { config } from 'src/config';
import { Public } from 'src/modules/iam/shared/decorators/public.decorator';
import {
    IBasicErrorResponse,
    IBasicResponse,
} from 'src/shared/interfaces/basic-response.interface';

@Controller({
    path: 'health',
    version: '1',
})
@Public()
export class HealthV1Controller {
    constructor(
        private readonly health: HealthCheckService,
        private readonly httpHealth: HttpHealthIndicator,
        private readonly typeOrmHealth: TypeOrmHealthIndicator,
    ) {}

    @Get()
    @HealthCheck()
    async checkHealth(): Promise<IBasicResponse<any>> {
        try {
            const health = await this.health.check([
                () =>
                    this.httpHealth.pingCheck(
                        'nest-js',
                        'https://docs.nestjs.com',
                    ),
                () =>
                    this.typeOrmHealth.pingCheck('database', {
                        timeout: config.db.connectTimeoutMS,
                    }),
            ]);

            return {
                message: 'Health check passed',
                data: health.details || {},
            };
        } catch (error) {
            return {
                message: 'Health check failed',
                errors: error.response.details || [],
            } as IBasicErrorResponse;
        }
    }
}
