import { Queue } from 'bullmq';
import { TQueueSlackJob } from '../constants/queue-name.constant';
import { IQueueService } from '../interfaces/queue-service.interface';

export class QueueSlackService implements IQueueService {
    constructor(private readonly queue: Queue) {}

    /**
     * Adds a job to the queue to send a Slack message.
     * @param data The data required to send the Slack message, including channel, text, and other optional parameters.
     * @returns {Promise<void>} A promise that resolves when the job is added to the queue.
     * @memberof QueueSlackService
     */
    async sendToQueue<T>(data: T, jobName: TQueueSlackJob): Promise<void> {
        try {
            await this.queue.add(jobName, data);
        } catch (error) {
            throw new Error(`Failed to add job to the queue: ${error.message}`);
        }
    }
}
