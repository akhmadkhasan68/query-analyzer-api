import { Module } from '@nestjs/common';
import { HttpModule } from 'nestjs-http-promise';
import { config } from 'src/config';
import { GitlabV1Controller } from './controllers/gitlab-v1.controller';
import { GitlabV1Service } from './services/gitlab-v1.service';

@Module({
    imports: [
        HttpModule.register({
            baseURL: config.gitlab.apiBaseUrl,
            timeout: 10000,
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'PRIVATE-TOKEN': config.gitlab.apiToken,
            },
        }),
    ],
    controllers: [GitlabV1Controller],
    providers: [GitlabV1Service],
    exports: [GitlabV1Service],
})
export class GitlabModule {}
