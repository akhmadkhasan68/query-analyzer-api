export const QUEUE_NAME = {
    Mail: 'mail',
} as const;

export type TQueueName = (typeof QUEUE_NAME)[keyof typeof QUEUE_NAME];
