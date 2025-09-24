export const QueueName = {
    Mail: 'mail',
    QueryTransactionEvent: 'query-transaction-event',
} as const;

export type TQueueName = (typeof QueueName)[keyof typeof QueueName];

export const QueueMailJob = {
    SendMail: 'send-mail',
} as const;

export type TQueueMailJob = (typeof QueueMailJob)[keyof typeof QueueMailJob];

export const QueueQueryTransactionEventJob = {
    SendQueryTransactionEvent: 'send-query-transaction-event',
    SendAIAnalysisEvent: 'send-ai-analysis-event',
} as const;

export type TQueueQueryTransactionEventJob =
    (typeof QueueQueryTransactionEventJob)[keyof typeof QueueQueryTransactionEventJob];

export type TQueueJob = TQueueMailJob | TQueueQueryTransactionEventJob;
