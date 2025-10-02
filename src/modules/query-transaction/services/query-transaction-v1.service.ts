import { Injectable } from '@nestjs/common';
import { IQueryTransaction } from 'src/infrastructures/databases/schema/interfaces/query-transaction.interface';
import { ProjectV1Repository } from 'src/modules/project/repositories/project-v1.repository';
import { QueryTransactionCreateV1Request } from '../dtos/requests/query-transaction-create-v1.request';
import { QueryTransactionV1Repository } from '../repositories/query-transaction-v1.repository';
import { QueryTransactionStatusEnum } from '../shared/enums/query-transaction-status.enum';

@Injectable()
export class QueryTransactionV1Service {
    constructor(
        private readonly queryTransactionV1Repository: QueryTransactionV1Repository,
        private readonly projectRepository: ProjectV1Repository,
    ) {}

    async createTransaction(
        data: QueryTransactionCreateV1Request,
    ): Promise<IQueryTransaction> {
        const project =
            await this.projectRepository.findOneOrFailByIdWithRelations(
                data.projectId,
                ['platform'],
            );

        const createData: Partial<IQueryTransaction> = {
            project,
            rawQuery: data.rawQuery,
            parameters: data.parameters,
            signature: data.signature,
            firstOccurrence: new Date(),
            occurrenceCount: 1,
            totalExecutionTime: data.totalExecutionTime,
            averageExecutionTime: data.averageExecutionTime,
            maxExecutionTime: data.maxExecutionTime,
            minExecutionTime: data.minExecutionTime,
            environment: data.environment,
            status: QueryTransactionStatusEnum.OPEN,
        };

        return await this.queryTransactionV1Repository.create(createData);
    }

    async updateTransactionBySignature(
        signature: string,
        data: Partial<IQueryTransaction>,
    ): Promise<IQueryTransaction> {
        const existingTransaction =
            await this.queryTransactionV1Repository.findOneOrFailBySignature(
                signature,
            );

        existingTransaction.occurrenceCount += 1;
        existingTransaction.totalExecutionTime =
            (existingTransaction.totalExecutionTime || 0) +
            (data.totalExecutionTime || 0);
        existingTransaction.averageExecutionTime =
            existingTransaction.totalExecutionTime /
            existingTransaction.occurrenceCount;

        if (data.maxExecutionTime) {
            existingTransaction.maxExecutionTime = Math.max(
                existingTransaction.maxExecutionTime || 0,
                data.maxExecutionTime,
            );
        }

        if (data.minExecutionTime) {
            existingTransaction.minExecutionTime = Math.min(
                existingTransaction.minExecutionTime || Infinity,
                data.minExecutionTime,
            );
        }

        return await this.queryTransactionV1Repository.update(
            existingTransaction.id!,
            existingTransaction,
        );
    }
}
