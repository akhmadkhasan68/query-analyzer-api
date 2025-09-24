import { Queue } from 'bullmq';
import { TQueueMailJob } from '../constants/queue-name.constant';
import { IQueueService } from '../interfaces/queue-service.interface';

export class QueueMailService implements IQueueService {
    constructor(private readonly queue: Queue) {}

    /**
     * Adds a job to the queue to send an email.
     * @param data The data required to send the email, including recipient, subject, template, and context.
     * @returns {Promise<void>} A promise that resolves when the job is added to the queue.
     * @memberof QueueMailService
     */
    async sendToQueue<T>(data: T, jobName: TQueueMailJob): Promise<void> {
        try {
            await this.queue.add(jobName, data);
        } catch (error) {
            throw new Error(`Failed to add job to the queue: ${error.message}`);
        }
    }
}
