import { Injectable, Logger } from '@nestjs/common';
import { HttpIntegrationV1Service } from 'src/infrastructures/integrations/http/http-integration-v1.service';
import { QueryTransactionEventV1Service } from 'src/modules/query-transaction/services/query-transaction-event-v1.service';
import {
    SlackInteractivePayloadActionDto,
    SlackInteractivePayloadContainerDto,
    SlackInteractivePayloadUserDto,
    SlackInteractivePayloadV1Dto,
} from '../shared/dtos/slack-interactive/slack-interactive-payload-v1.dto';
import { SlackInteractiveActionIdEnum } from '../shared/enums/slack-interactive-action-id.enum';

@Injectable()
export class SlackInteractiveV1Service {
    constructor(
        private readonly httpService: HttpIntegrationV1Service,
        private readonly queryTransactionEventService: QueryTransactionEventV1Service,
    ) {}

    private readonly logger = new Logger(SlackInteractiveV1Service.name);

    async handleInteraction(
        payload: SlackInteractivePayloadV1Dto,
    ): Promise<void> {
        const actions = payload.actions;
        const user = payload.user;
        const container = payload.container;

        // Verify that actions exist
        if (!actions || actions.length === 0) {
            throw new Error('No actions found in the payload');
        }

        // Process each action
        for (const action of actions) {
            switch (action.actionId) {
                case SlackInteractiveActionIdEnum.BtnAiAnalyzeQueryEvent:
                    await this.handleAIAnalyzeQueryEventAction(
                        action,
                        user,
                        container,
                    );
                    break;
                default:
                    this.logger.warn(`Unhandled action ID: ${action.actionId}`);
                    break;
            }
        }
    }

    private async handleAIAnalyzeQueryEventAction(
        action: SlackInteractivePayloadActionDto,
        slackUser: SlackInteractivePayloadUserDto,
        container: SlackInteractivePayloadContainerDto,
    ): Promise<void> {
        console.log('Slack User:', slackUser);
        console.log('Slack Container:', container);

        try {
            const queryTransactionEvent =
                await this.queryTransactionEventService.findOneByQueryId(
                    action.value,
                );

            const project = queryTransactionEvent.project;
            const projectSlackChannels = project.projectSlackChannels || [];

            if (projectSlackChannels.length === 0) {
                this.logger.warn(
                    `No Slack channels configured for project ${project.name} (${project.id})`,
                );
                return;
            }

            await this.queryTransactionEventService.AIAnalyze({
                ids: [queryTransactionEvent.id],
                slackUserId: slackUser.id,
                slackChannelId: container.channelId,
                slackMessageTs: container.messageTs,
            });
        } catch (error) {
            this.logger.error('Error handling interactive action:', error);

            throw error;
        }
    }
}
