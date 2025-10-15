import { Body, Controller, Param, Post } from '@nestjs/common';
import { ExcludeGlobalGuard } from 'src/modules/iam/shared/decorators/public.decorator';
import { JsonUtil } from 'src/shared/utils/json.util';
import { SlackHandleCommandPayloadV1Request } from '../dtos/requests/slack-handle-command-payload-v1.request';
import { SlackInteractivePayloadV1Request } from '../dtos/requests/slack-handle-interactive-payload-v1.request';
import { SlackCommandV1Service } from '../services/slack-command-v1.service';
import { SlackInteractiveV1Service } from '../services/slack-interactive-v1.service';
import { SlackInteractivePayloadV1Dto } from '../shared/dtos/slack-interactive/slack-interactive-payload-v1.dto';

@Controller({
    path: 'slack',
    version: '1',
})
@ExcludeGlobalGuard()
export class SlackV1Controller {
    constructor(
        private readonly slackCommandV1Service: SlackCommandV1Service,
        private readonly slackInteractiveV1Service: SlackInteractiveV1Service,
    ) {}

    @Post('command/:slashCommand')
    async handleCommand(
        @Param('slashCommand') slashCommand: string,
        @Body() body: SlackHandleCommandPayloadV1Request,
    ): Promise<string> {
        return this.slackCommandV1Service.handleCommand(slashCommand, body);
    }

    @Post('interaction')
    async handleInteraction(
        @Body() body: SlackInteractivePayloadV1Request,
    ): Promise<string> {
        const data = JsonUtil.parse<SlackInteractivePayloadV1Dto>(body.payload);
        if (!data) {
            return 'Invalid payload';
        }

        await this.slackInteractiveV1Service.handleInteraction(data);

        return 'OK';
    }
}
