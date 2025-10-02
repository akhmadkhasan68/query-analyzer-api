import { Injectable } from '@nestjs/common';
import { SlackCommandHandleCommandV1Request } from '../dtos/requests/slack-command-handle-command-v1.request';
import { SlackCommandEnum } from '../shared/enums/slack-command.enum';
import { SlackMessageV1Service } from './slack-message-v1.service';

@Injectable()
export class SlackCommandV1Service {
    constructor(
        private readonly slackMessageV1Service: SlackMessageV1Service,
    ) {}

    async handleCommand(
        slashCommand: string,
        body: SlackCommandHandleCommandV1Request,
    ): Promise<string> {
        if (!this.validateCommands(slashCommand)) {
            return `Invalid command: ${slashCommand}`;
        }

        switch (slashCommand) {
            case SlackCommandEnum.Test:
                return this.handleTestCommand(body);
            default:
                return `Unknown command: ${slashCommand}`;
        }
    }

    private validateCommands(command: string): boolean {
        return Object.values(SlackCommandEnum).includes(
            command as SlackCommandEnum,
        );
    }

    private async handleTestCommand(
        body: SlackCommandHandleCommandV1Request,
    ): Promise<string> {
        // Implement your logic for the /test command here
        return `You invoked the /test command with text: ${body.text || 'no text provided'}`;
    }
}
