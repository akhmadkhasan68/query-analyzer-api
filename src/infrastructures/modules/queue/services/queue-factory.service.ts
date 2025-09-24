import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueName, TQueueName } from '../constants/queue-name.constant';
import { IQueueService } from '../interfaces/queue-service.interface';
import { QueueMailService } from './queue-mail.service';
import { QueueQueryTransactionEventService } from './queue-query-transaction-event.service';

@Injectable()
export class QueueFactoryService {
    constructor(
        @InjectQueue(QueueName.Mail)
        private readonly queueMail: Queue,

        @InjectQueue(QueueName.QueryTransactionEvent)
        private readonly queueQueryTransactionEvent: Queue,
    ) {}

    createQueueService(queueName: TQueueName): IQueueService {
        switch (queueName) {
            case QueueName.Mail: {
                return new QueueMailService(this.queueMail);
            }
            case QueueName.QueryTransactionEvent: {
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
