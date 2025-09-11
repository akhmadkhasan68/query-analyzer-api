export const QUEUE_NAME = {
    Mail: 'mail',
    QueryTransactionEvent: 'query-transaction-event',
} as const;

export type TQueueName = (typeof QUEUE_NAME)[keyof typeof QUEUE_NAME];
