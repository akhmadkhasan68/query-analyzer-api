import { BullModule, RegisterQueueOptions } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { QueryTransactionModule } from 'src/modules/query-transaction/query-transaction.module';
import { SlackModule } from 'src/modules/slack/slack.module';
import { MailModule } from '../mail/mail.module';
import { QueueName } from './constants/queue-name.constant';
import { QueueMailProcessor } from './processors/queue-mail.processor';
import { QueueQueryTransactionEventProcessor } from './processors/queue-query-transaction-event.processor';
import { QueueSlackProcessor } from './processors/queue-slack.processor';
import { QueueFactoryService } from './services/queue-factory.service';

@Module({
    imports: [
        BullModule.registerQueue(
            ...(Object.values(QueueName).map((queueName) => {
                return {
                    name: queueName,
                } as RegisterQueueOptions;
            }) as RegisterQueueOptions[]),
        ),
        MailModule,
        forwardRef(() => QueryTransactionModule),
        forwardRef(() => SlackModule),
    ],
    providers: [
        QueueFactoryService,

        // Queue Processors
        QueueMailProcessor,
        QueueQueryTransactionEventProcessor,
        QueueSlackProcessor,
    ],
    exports: [QueueFactoryService],
})
export class QueueModule {}
