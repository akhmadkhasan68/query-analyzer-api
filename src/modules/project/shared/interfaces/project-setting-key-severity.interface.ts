import { QueryTransactionSeverityEnum } from 'src/modules/query-transaction/shared/enums/query-transaction-severity.enum';

export interface IProjectSettingKeySeverity {
    level: QueryTransactionSeverityEnum;
    threshold: number;
}
