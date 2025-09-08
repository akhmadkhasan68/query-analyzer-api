import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    QueryTransactionEvent,
    QueryTransactionEventSchema,
} from 'src/infrastructures/databases/schema/query-transaction-event.schema';
import {
    QueryTransaction,
    QueryTransactionSchema,
} from 'src/infrastructures/databases/schema/query-transaction.schema';
import { QueryTransactionV1Controller } from './controllers/query-transaction-v1.controller';
import { QueryTransactionEventV1Repository } from './repositories/query-transaction-event-v1.repository';
import { QueryTransactionV1Repository } from './repositories/query-transaction-v1.repository';
import { QueryTransactionV1Service } from './services/query-transaction-v1.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: QueryTransaction.name,
                schema: QueryTransactionSchema,
            },
            {
                name: QueryTransactionEvent.name,
                schema: QueryTransactionEventSchema,
            },
        ]),
    ],
    controllers: [QueryTransactionV1Controller],
    providers: [
        // Services
        QueryTransactionV1Service,

        // Repositories
        QueryTransactionV1Repository,
        QueryTransactionEventV1Repository,
    ],
    exports: [],
})
export class QueryTransactionModule {}
