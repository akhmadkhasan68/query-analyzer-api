import { Injectable, Logger } from '@nestjs/common';
import { HttpIntegrationV1Service } from 'src/infrastructures/integrations/http/http-integration-v1.service';
import {
    QueueName,
    QueueSlackJob,
} from 'src/infrastructures/modules/queue/constants/queue-name.constant';
import { QueueSlackSendMessageDto } from 'src/infrastructures/modules/queue/dtos/queue-slack-send-message.dto';
import { IQueueService } from 'src/infrastructures/modules/queue/interfaces/queue-service.interface';
import { QueueFactoryService } from 'src/infrastructures/modules/queue/services/queue-factory.service';
import { SlackRouteConstant } from '../shared/constants/slack-route.constant';
import {
    SlackPostMessageRequestDto,
    TSlackBlockDto,
} from '../shared/dtos/requests/slack-post-message-request.dto';

@Injectable()
export class SlackMessageV1Service {
    private queueSlackService: IQueueService;
    private readonly logger = new Logger(SlackMessageV1Service.name);

    constructor(
        private readonly httpService: HttpIntegrationV1Service,
        private readonly queueFactoryService: QueueFactoryService,
    ) {
        this.queueSlackService = this.queueFactoryService.createQueueService(
            QueueName.Slack,
        );
    }

    async sendMessageToMultipleChannels(
        channelIds: string[],
        blocks: TSlackBlockDto[],
    ): Promise<void> {
        try {
            // Send message to queue
            await Promise.all(
                channelIds.map((channelId) =>
                    this.queueSlackService.sendToQueue<QueueSlackSendMessageDto>(
                        {
                            channelId,
                            blocks: blocks,
                        },
                        QueueSlackJob.SendSlackMessage,
                    ),
                ),
            );
        } catch (error) {
            throw error;
        }
    }

    async sendMessageToChannelInThread(
        channelId: string,
        threadTs: string,
        blocks: TSlackBlockDto[],
    ): Promise<void> {
        try {
            await this.queueSlackService.sendToQueue<QueueSlackSendMessageDto>(
                {
                    channelId,
                    blocks: blocks,
                    threadTs: threadTs,
                },
                QueueSlackJob.SendSlackMessage,
            );
        } catch (error) {
            throw error;
        }
    }

    async sendMessageToChannel(
        channelId: string,
        blocks: TSlackBlockDto[],
    ): Promise<void> {
        return this.queueSlackService.sendToQueue<QueueSlackSendMessageDto>(
            {
                channelId,
                blocks: blocks,
            },
            QueueSlackJob.SendSlackMessage,
        );
    }

    async queueProcessSendMessage(
        channelId: string,
        blocks: TSlackBlockDto[],
        threadTs?: string,
    ): Promise<void> {
        this.logger.log(
            `Processing send slack message to channel: ${channelId}`,
        );

        try {
            await this.httpService.post<SlackPostMessageRequestDto, any>(
                SlackRouteConstant.chatPostMessage,
                new SlackPostMessageRequestDto(channelId, blocks, threadTs),
            );
        } catch (error) {
            this.logger.error(
                `Error sending slack message to channel ${channelId}: ${error.message}`,
            );

            throw error;
        }
    }
}
