import { TSlackBlockDto } from 'src/modules/slack/shared/dtos/requests/slack-post-message-request.dto';

export class QueueSlackSendMessageDto {
    channelId: string;
    blocks: TSlackBlockDto[];
}
