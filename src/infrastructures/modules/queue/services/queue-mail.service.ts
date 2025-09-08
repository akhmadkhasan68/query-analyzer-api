import { Queue } from 'bullmq';
import { MailSendDto } from '../../mail/dto/mail-send.dto';
import { IQueueService } from '../interfaces/queue-service.interface';

export class QueueMailService implements IQueueService {
    constructor(private readonly queue: Queue<MailSendDto>) {}

    /**
     * The name of the job that will be added to the queue.
     * This is used to identify the job type when processing it.
     * * @private
     * @type {string}
     * @memberof QueueMailService
     */
    private readonly JOB_NAME: string = 'send-mail';

    /**
     * Adds a job to the queue to send an email.
     * @param data The data required to send the email, including recipient, subject, template, and context.
     * @returns {Promise<void>} A promise that resolves when the job is added to the queue.
     * @memberof QueueMailService
     */
    async sendToQueue(data: MailSendDto): Promise<void> {
        try {
            await this.queue.add(this.JOB_NAME, data);
        } catch (error) {
            throw new Error(`Failed to add job to the queue: ${error.message}`);
        }
    }
}
