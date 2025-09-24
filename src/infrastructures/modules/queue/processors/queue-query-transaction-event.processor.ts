import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueryTransactionEventV1Service } from 'src/modules/query-transaction/services/query-transaction-event-v1.service';
import {
    QueueName,
    QueueQueryTransactionEventJob,
} from '../constants/queue-name.constant';
import { QueueQueryTransactionEventSendAiAnalysisEventDto } from '../dtos/queue-query-transaction-event-send-ai-analysis-event.dto';
import { QueueQueryTransactionEventDto } from '../dtos/queue-query-transaction-event.dto';

@Processor(QueueName.QueryTransactionEvent)
export class QueueQueryTransactionEventProcessor extends WorkerHost {
    constructor(
        private readonly queryTransactionEventService: QueryTransactionEventV1Service,
    ) {
        super();
    }

    private readonly logger = new Logger(
        QueueQueryTransactionEventProcessor.name,
    );

    async process(job: Job): Promise<any> {
        try {
            this.logger.log(`Processing job: ${job.id}`);
            const jobName = job.name;

            switch (jobName) {
                case QueueQueryTransactionEventJob.SendQueryTransactionEvent: {
                    const { project, projectKey, ...request } =
                        job.data as QueueQueryTransactionEventDto;

                    await this.queryTransactionEventService.queueProcessCaptureEvent(
                        project,
                        projectKey,
                        request,
                    );

                    break;
                }
                case QueueQueryTransactionEventJob.SendAIAnalysisEvent: {
                    const data =
                        job.data as QueueQueryTransactionEventSendAiAnalysisEventDto;

                    await this.queryTransactionEventService.queueProcessAIAnalyze(
                        data,
                    );
                }
                default:
                    throw new Error(`Unknown job name: ${jobName}`);
            }
        } catch (error) {
            this.logger.error(
                `Error processing job: ${error.message} ${error.stack}`,
            );
            throw new Error(`Failed to process job: ${error.message}`);
        }
    }
}
