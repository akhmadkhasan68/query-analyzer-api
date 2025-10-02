export class SlackMessageFormatHelper {
    static readonly Bold = (text: string): string => `*${text}*`;
    static readonly Italic = (text: string): string => `_${text}_`;
    static readonly Strikethrough = (text: string): string => `~${text}~`;

    /** Code Blocks */
    static readonly Code = (text: string): string => `\`${text}\``;
    static readonly CodeBlock = (text: string): string => `\`\`\`${text}\`\`\``;
    static readonly Quoted = (text: string): string => `>${text}`;

    /** Mentions */
    static readonly MentionUser = (userId: string): string => `<@${userId}>`;
    static readonly MentionChannel = (channelId: string): string =>
        `<#${channelId}>`;
    static readonly MentionHere = (): string => '<!here>';
    static readonly MentionEveryone = (): string => '<!everyone>';
    static readonly MentionChannelAll = (): string => '<!channel>';

    /** Emoji Helpers */
    static readonly Emoji = (emojiName: string): string => `:${emojiName}:`;
}
