import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueName, TQueueName } from '../constants/queue-name.constant';
import { IQueueService } from '../interfaces/queue-service.interface';
import { QueueMailService } from './queue-mail.service';
import { QueueQueryTransactionEventService } from './queue-query-transaction-event.service';
import { QueueSlackService } from './queue-slack.service';

@Injectable()
export class QueueFactoryService {
    constructor(
        @InjectQueue(QueueName.Mail)
        private readonly queueMail: Queue,

        @InjectQueue(QueueName.QueryTransactionEvent)
        private readonly queueQueryTransactionEvent: Queue,

        @InjectQueue(QueueName.Slack)
        private readonly queueSlack: Queue,
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
            case QueueName.Slack: {
                return new QueueSlackService(this.queueSlack);
            }
            default: {
                throw new Error(
                    `Queue with name ${queueName} is not supported.`,
                );
            }
        }
    }
}
