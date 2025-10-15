export class SlackInteractivePayloadV1Dto {
    type: string;
    team: SlackInteractivePayloadTeamDto;
    user: SlackInteractivePayloadUserDto;
    apiAppId: string;
    token: string;
    container: SlackInteractivePayloadContainerDto;
    triggerID: string;
    channel: SlackInteractivePayloadChannelDto;
    message: SlackInteractivePayloadMessageDto;
    responseURL: string;
    actions: SlackInteractivePayloadActionDto[];
}

export class SlackInteractivePayloadTeamDto {
    id: string;
    domain: string;
}

export class SlackInteractivePayloadUserDto {
    id: string;
    username: string;
    teamId: string;
}

export class SlackInteractivePayloadContainerDto {
    type: string;
    messageTs: string;
    attachmentId: number;
    channelId: string;
    isEphemeral: boolean;
    threadTs?: string;
    isAppUnfurl: boolean;
}

export class SlackInteractivePayloadChannelDto {
    id: string;
    name: string;
}

export class SlackInteractivePayloadMessageDto {
    botId: string;
    type: string;
    text: string;
    user: string;
    ts: string;
}

export class SlackInteractivePayloadActionDto {
    actionId: string;
    blockId: string;
    text: SlackInteractivePayloadActionTextDto;
    value: string;
    type: string;
    actionTs: string;
}

export class SlackInteractivePayloadActionTextDto {
    type: string;
    text: string;
    emoji: boolean;
}
