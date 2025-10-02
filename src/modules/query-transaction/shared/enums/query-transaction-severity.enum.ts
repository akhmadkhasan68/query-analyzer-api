export enum QueryTransactionSeverityEnum {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export const QueryTransactionSeverityEnumLabels: Record<
    QueryTransactionSeverityEnum,
    string
> = {
    [QueryTransactionSeverityEnum.LOW]: 'Low',
    [QueryTransactionSeverityEnum.MEDIUM]: 'Medium',
    [QueryTransactionSeverityEnum.HIGH]: 'High',
    [QueryTransactionSeverityEnum.CRITICAL]: 'Critical',
};
