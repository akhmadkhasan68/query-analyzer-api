export const SlackBlockType = {
    Actions: 'actions',
    Header: 'header',
    Section: 'section',
    Divider: 'divider',
};

export type TSlackBlockType =
    (typeof SlackBlockType)[keyof typeof SlackBlockType];

export const SlackBlockTextType = {
    PlainText: 'plain_text',
    Mrkdwn: 'mrkdwn',
} as const;

export type TSlackBlockTextType =
    (typeof SlackBlockTextType)[keyof typeof SlackBlockTextType];

export const SlackBlockElementType = {
    Button: 'button',
    StaticSelect: 'static_select',
    Overflow: 'overflow',
    PlainTextInput: 'plain_text_input',
    DatePicker: 'datepicker',
} as const;

export type TSlackBlockElementType =
    (typeof SlackBlockElementType)[keyof typeof SlackBlockElementType];
