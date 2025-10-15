import { forwardRef, Module } from '@nestjs/common';
import { config } from 'src/config';
import { HttpIntegrationModule } from 'src/infrastructures/integrations/http/http-integration.module';
import { QueryTransactionModule } from '../query-transaction/query-transaction.module';
import { N8nCallbackV1Controller } from './controllers/n8n-callback-v1.controller';
import { N8nWebhookV1Service } from './services/n8n-webhook-v1.service';

@Module({
    imports: [
        HttpIntegrationModule.register({
            baseURL: config.n8n.baseUrl,
            timeout: 10000,
            maxRedirects: 5,
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
            },
        }),
        forwardRef(() => QueryTransactionModule),
    ],
    controllers: [N8nCallbackV1Controller],
    providers: [N8nWebhookV1Service],
    exports: [N8nWebhookV1Service],
})
export class N8nModule {}
