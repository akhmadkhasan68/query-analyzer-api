export const QueueName = {
    Mail: 'mail',
    QueryTransactionEvent: 'query-transaction-event',
    Slack: 'slack',
} as const;

export type TQueueName = (typeof QueueName)[keyof typeof QueueName];

export const QueueMailJob = {
    SendMail: 'send-mail',
} as const;

export type TQueueMailJob = (typeof QueueMailJob)[keyof typeof QueueMailJob];

export const QueueQueryTransactionEventJob = {
    SendQueryTransactionEvent: 'send-query-transaction-event',
    SendAIAnalysisEvent: 'send-ai-analysis-event',
    SendAIAnalysisQueryTransactionEventWithNotify:
        'send-ai-analysis-query-transaction-event-with-notify',
} as const;

export type TQueueQueryTransactionEventJob =
    (typeof QueueQueryTransactionEventJob)[keyof typeof QueueQueryTransactionEventJob];

export const QueueSlackJob = {
    SendSlackMessage: 'send-slack-message',
} as const;

export type TQueueSlackJob = (typeof QueueSlackJob)[keyof typeof QueueSlackJob];

/**
 * Union type of all queue job types.
 */
export type TQueueJob =
    | TQueueMailJob
    | TQueueQueryTransactionEventJob
    | TQueueSlackJob;
