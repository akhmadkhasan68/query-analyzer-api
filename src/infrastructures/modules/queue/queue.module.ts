import { BullModule, RegisterQueueOptions } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { QUEUE_NAME } from './constants/queue-name.constant';
import { QueueMailProcessor } from './processors/queue-mail.processor';
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
    ],
    providers: [
        QueueFactoryService,

        // Queue Processors
        QueueMailProcessor,
    ],
    exports: [QueueFactoryService],
})
export class QueueModule {}
