export interface IQueueService {
    sendToQueue(data: any): Promise<void>;
}
