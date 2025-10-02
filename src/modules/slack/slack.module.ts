import { forwardRef, Module } from '@nestjs/common';
import { config } from 'src/config';
import { HttpIntegrationModule } from 'src/infrastructures/integrations/http/http-integration.module';
import { AuthorizationType } from 'src/infrastructures/integrations/http/interfaces/http-integration-options.interface';
import { QueueModule } from 'src/infrastructures/modules/queue/queue.module';
import { SlackCommandV1Controller } from './controllers/slack-command-v1.controller';
import { SlackCommandV1Service } from './services/slack-command-v1.service';
import { SlackMessageV1Service } from './services/slack-message-v1.service';

@Module({
    imports: [
        HttpIntegrationModule.register({
            baseURL: config.slack.baseUrl,
            authorizationType: AuthorizationType.Bearer,
            authorizationToken: config.slack.botOAuthToken,
            timeout: 10000,
        }),
        forwardRef(() => QueueModule),
    ],
    controllers: [SlackCommandV1Controller],
    providers: [SlackCommandV1Service, SlackMessageV1Service],
    exports: [SlackMessageV1Service],
})
export class SlackModule {}
