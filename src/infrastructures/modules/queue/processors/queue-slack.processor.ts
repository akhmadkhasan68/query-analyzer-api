import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SlackMessageV1Service } from 'src/modules/slack/services/slack-message-v1.service';
import { QueueName, QueueSlackJob } from '../constants/queue-name.constant';
import { QueueSlackSendMessageDto } from '../dtos/queue-slack-send-message.dto';

@Processor(QueueName.Slack)
export class QueueSlackProcessor extends WorkerHost {
    constructor(private readonly slackMessageService: SlackMessageV1Service) {
        super();
    }

    async process(job: Job, _token?: string): Promise<void> {
        try {
            const jobName = job.name;

            switch (jobName) {
                case QueueSlackJob.SendSlackMessage: {
                    const { channelId, blocks, threadTs } =
                        job.data as QueueSlackSendMessageDto;

                    await this.slackMessageService.queueProcessSendMessage(
                        channelId,
                        blocks,
                        threadTs,
                    );

                    break;
                }
                default:
                    throw new Error(`Unknown job name: ${jobName}`);
            }
        } catch (error) {
            // console.error(`Error processing job: ${error.message}`);
            throw new Error(`Failed to process job: ${error.message}`);
        }
    }
}
