import {
    SlackBlockType,
    TSlackBlockElementType,
    TSlackBlockTextType,
    TSlackBlockType,
} from '../../constants/slack-message.constant';

type TSlackBlockText = {
    type: TSlackBlockTextType;
    text: string;
    emoji?: boolean;
};

export class SlackBlockHeaderDto {
    type: TSlackBlockType = SlackBlockType.Header;
    text: TSlackBlockText;
}

export class SlackBlockSectionDto {
    type: TSlackBlockType = SlackBlockType.Section;
    text: TSlackBlockText;
}

export class SlackBlockDividerDto {
    type: TSlackBlockType = SlackBlockType.Divider;
}

type TSlackBlockActionsElement = {
    type: TSlackBlockElementType;
    text?: TSlackBlockText;
    value?: string;
    action_id?: string;
    url?: string;
    style?: 'primary' | 'danger';
};

export class SlackBlockActionsDto {
    type: TSlackBlockType = SlackBlockType.Actions;
    elements: TSlackBlockActionsElement[];
}

export type TSlackBlockDto =
    | SlackBlockHeaderDto
    | SlackBlockSectionDto
    | SlackBlockDividerDto
    | SlackBlockActionsDto;

export class SlackPostMessageRequestDto {
    public channel: string;
    public blocks: TSlackBlockDto[];

    constructor(channel: string, blocks: TSlackBlockDto[]) {
        this.channel = channel;
        this.blocks = blocks;
    }
}
