import { Injectable } from '@nestjs/common';
import { SlackHandleCommandPayloadV1Request } from '../dtos/requests/slack-handle-command-payload-v1.request';
import { SlackCommandEnum } from '../shared/enums/slack-command.enum';

@Injectable()
export class SlackCommandV1Service {
    constructor() {}

    async handleCommand(
        slashCommand: string,
        body: SlackHandleCommandPayloadV1Request,
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
        body: SlackHandleCommandPayloadV1Request,
    ): Promise<string> {
        // Implement your logic for the /test command here
        return `You invoked the /test command with text: ${body.text || 'no text provided'}`;
    }
}
