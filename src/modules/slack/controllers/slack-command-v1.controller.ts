import { Body, Controller, Param, Post } from '@nestjs/common';
import { ExcludeGlobalGuard } from 'src/modules/iam/shared/decorators/public.decorator';
import { SlackCommandHandleCommandV1Request } from '../dtos/requests/slack-command-handle-command-v1.request';
import { SlackCommandV1Service } from '../services/slack-command-v1.service';

@Controller({
    path: 'slack/command',
    version: '1',
})
@ExcludeGlobalGuard()
export class SlackCommandV1Controller {
    constructor(
        private readonly slackCommandV1Service: SlackCommandV1Service,
    ) {}

    @Post(':slashCommand')
    async handleCommand(
        @Param('slashCommand') slashCommand: string,
        @Body() body: SlackCommandHandleCommandV1Request,
    ): Promise<string> {
        return this.slackCommandV1Service.handleCommand(slashCommand, body);
    }
}
