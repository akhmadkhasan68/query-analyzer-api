import { BullModule, RegisterQueueOptions } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { QueryTransactionModule } from 'src/modules/query-transaction/query-transaction.module';
import { MailModule } from '../mail/mail.module';
import { QUEUE_NAME } from './constants/queue-name.constant';
import { QueueMailProcessor } from './processors/queue-mail.processor';
import { QueueQueryTransactionEventProcessor } from './processors/queue-query-transaction-event.processor';
import { QueueFactoryService } from './services/queue-factory.service';

@Module({
    imports: [
        BullModule.registerQueue(
            ...(Object.values(QUEUE_NAME).map((queueName) => {
                return {
                    name: queueName,
                } as RegisterQueueOptions;
            }) as RegisterQueueOptions[]),
        ),
        MailModule,
        forwardRef(() => QueryTransactionModule),
    ],
    providers: [
        QueueFactoryService,

        // Queue Processors
        QueueMailProcessor,
        QueueQueryTransactionEventProcessor,
    ],
    exports: [QueueFactoryService],
})
export class QueueModule {}
