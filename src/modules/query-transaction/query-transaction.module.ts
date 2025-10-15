import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    QueryTransactionEventAnalyzeReport,
    QueryTransactionEventAnalyzeReportSchema,
} from 'src/infrastructures/databases/schema/query-transaction-event-analyze-report.schema';
import {
    QueryTransactionEvent,
    QueryTransactionEventSchema,
} from 'src/infrastructures/databases/schema/query-transaction-event.schema';
import {
    QueryTransaction,
    QueryTransactionSchema,
} from 'src/infrastructures/databases/schema/query-transaction.schema';
import { QueueModule } from 'src/infrastructures/modules/queue/queue.module';
import { N8nModule } from '../n8n/n8n.module';
import { ProjectModule } from '../project/project.module';
import { SlackModule } from '../slack/slack.module';
import { StorageFileModule } from '../storage-file/storage-file.module';
import { QueryTransactionEventV1Controller } from './controllers/query-transaction-event-v1.controller';
import { QueryTransactionV1Controller } from './controllers/query-transaction-v1.controller';
import { QueryTransactionEventAnalyzeReportV1Repository } from './repositories/query-transaction-event-analyze-report-v1.repository';
import { QueryTransactionEventV1Repository } from './repositories/query-transaction-event-v1.repository';
import { QueryTransactionV1Repository } from './repositories/query-transaction-v1.repository';
import { QueryTransactionEventV1Service } from './services/query-transaction-event-v1.service';
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
            {
                name: QueryTransactionEventAnalyzeReport.name,
                schema: QueryTransactionEventAnalyzeReportSchema,
            },
        ]),
        forwardRef(() => QueueModule),
        forwardRef(() => SlackModule),
        forwardRef(() => N8nModule),
        StorageFileModule,
        ProjectModule,
    ],
    controllers: [
        QueryTransactionV1Controller,
        QueryTransactionEventV1Controller,
    ],
    providers: [
        // Services
        QueryTransactionV1Service,
        QueryTransactionEventV1Service,

        // Repositories
        QueryTransactionV1Repository,
        QueryTransactionEventV1Repository,
        QueryTransactionEventAnalyzeReportV1Repository,
    ],
    exports: [
        QueryTransactionV1Service,
        QueryTransactionEventV1Service,
        QueryTransactionV1Repository,
        QueryTransactionEventV1Repository,
        QueryTransactionEventAnalyzeReportV1Repository,
    ],
})
export class QueryTransactionModule {}
