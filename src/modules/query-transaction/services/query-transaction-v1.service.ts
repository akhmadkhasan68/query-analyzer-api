import { Injectable } from '@nestjs/common';
import { IQueryTransaction } from 'src/infrastructures/databases/schema/interfaces/query-transaction.interface';
import { QueryTransactionCreateV1Request } from '../dtos/requests/query-transaction-create-v1.request';
import { QueryTransactionV1Repository } from '../repositories/query-transaction-v1.repository';
import { QueryTransactionStatusEnum } from '../shared/enums/query-transaction-status.enum';

@Injectable()
export class QueryTransactionV1Service {
    constructor(
        private readonly queryTransactionV1Repository: QueryTransactionV1Repository,
    ) {}

    async createTransaction(
        data: QueryTransactionCreateV1Request,
    ): Promise<IQueryTransaction> {
        // FIXME: This is just a placeholder. You should implement the actual logic.
        const createData: Partial<IQueryTransaction> = {
            // project: ,
            signature: 'Initial Signature',
            description: 'Initial Description',
            status: QueryTransactionStatusEnum.OPEN,
            firstOccurrence: new Date(),
            occurrenceCount: 1,
            totalExecutionTime: 0,
            averageExecutionTime: 0,
        };

        return await this.queryTransactionV1Repository.create(createData);
    }
}
