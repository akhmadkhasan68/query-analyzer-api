import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QUEUE_NAME, TQueueName } from '../constants/queue-name.constant';
import { IQueueService } from '../interfaces/queue-service.interface';
import { QueueMailService } from './queue-mail.service';

@Injectable()
export class QueueFactoryService {
    constructor(
        @InjectQueue(QUEUE_NAME.Mail)
        private readonly queueMail: Queue,
    ) {}

    createQueueService(queueName: TQueueName): IQueueService {
        switch (queueName) {
            case QUEUE_NAME.Mail: {
                return new QueueMailService(this.queueMail);
            }
            default: {
                throw new Error(
                    `Queue with name ${queueName} is not supported.`,
                );
            }
        }
    }
}
