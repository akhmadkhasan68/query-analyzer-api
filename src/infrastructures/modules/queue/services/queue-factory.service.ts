import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QUEUE_NAME, TQueueName } from '../constants/queue-name.constant';
import { IQueueService } from '../interfaces/queue-service.interface';
import { QueueMailService } from './queue-mail.service';
import { QueueQueryTransactionEventService } from './queue-query-transaction-event.service';

@Injectable()
export class QueueFactoryService {
    constructor(
        @InjectQueue(QUEUE_NAME.Mail)
        private readonly queueMail: Queue,

        @InjectQueue(QUEUE_NAME.QueryTransactionEvent)
        private readonly queueQueryTransactionEvent: Queue,
    ) {}

    createQueueService(queueName: TQueueName): IQueueService {
        switch (queueName) {
            case QUEUE_NAME.Mail: {
                return new QueueMailService(this.queueMail);
            }
            case QUEUE_NAME.QueryTransactionEvent: {
                return new QueueQueryTransactionEventService(
                    this.queueQueryTransactionEvent,
                );
            }
            default: {
                throw new Error(
                    `Queue with name ${queueName} is not supported.`,
                );
            }
        }
    }
}
