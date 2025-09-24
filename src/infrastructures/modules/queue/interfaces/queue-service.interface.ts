import { TQueueJob } from '../constants/queue-name.constant';

export interface IQueueService {
    sendToQueue<T>(data: T, jobName: TQueueJob): Promise<void>;
}
