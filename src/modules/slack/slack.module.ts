import { forwardRef, Module } from '@nestjs/common';
import { config } from 'src/config';
import { HttpIntegrationModule } from 'src/infrastructures/integrations/http/http-integration.module';
import { AuthorizationType } from 'src/infrastructures/integrations/http/shared/interfaces/http-integration-options.interface';
import { QueueModule } from 'src/infrastructures/modules/queue/queue.module';
import { QueryTransactionModule } from '../query-transaction/query-transaction.module';
import { SlackV1Controller } from './controllers/slack-v1.controller';
import { SlackCommandV1Service } from './services/slack-command-v1.service';
import { SlackInteractiveV1Service } from './services/slack-interactive-v1.service';
import { SlackMessageV1Service } from './services/slack-message-v1.service';

@Module({
    imports: [
        HttpIntegrationModule.register({
            baseURL: config.slack.baseUrl,
            authorizationType: AuthorizationType.Bearer,
            authorizationToken: config.slack.botOAuthToken,
            timeout: 10000, // TODO: make it configurable
        }),
        forwardRef(() => QueueModule),
        forwardRef(() => QueryTransactionModule),
    ],
    controllers: [SlackV1Controller],
    providers: [
        SlackCommandV1Service,
        SlackInteractiveV1Service,
        SlackMessageV1Service,
    ],
    exports: [SlackMessageV1Service],
})
export class SlackModule {}
