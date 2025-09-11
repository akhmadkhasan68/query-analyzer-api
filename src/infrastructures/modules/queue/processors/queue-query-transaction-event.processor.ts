import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueryTransactionEventV1Service } from 'src/modules/query-transaction/services/query-transaction-event-v1.service';
import { QUEUE_NAME } from '../constants/queue-name.constant';
import { QueueQueryTransactionEventDto } from '../dtos/queue-query-transaction-event.dto';

@Processor(QUEUE_NAME.QueryTransactionEvent)
export class QueueQueryTransactionEventProcessor extends WorkerHost {
    constructor(
        private readonly queryTransactionEventService: QueryTransactionEventV1Service,
    ) {
        super();
    }

    private readonly logger = new Logger(
        QueueQueryTransactionEventProcessor.name,
    );

    async process(
        job: Job<QueueQueryTransactionEventDto>,
        token?: string,
    ): Promise<any> {
        try {
            this.logger.log(`Processing job: ${job.id}`);

            const { project, projectKey, ...request } = job.data;

            await this.queryTransactionEventService.queueProcessCaptureEvent(
                project,
                projectKey,
                request,
            );
        } catch (error) {
            this.logger.error(`Error processing job: ${error.message}`);
            throw new Error(`Failed to process job: ${error.message}`);
        }
    }
}
