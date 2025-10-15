import { IProject } from 'src/infrastructures/databases/entities/interfaces/project.interface';
import { IQueryTransactionEvent } from 'src/infrastructures/databases/schema/interfaces/query-transaction-event.interface';
import {
    QueryTransactionSeverityEnum,
    QueryTransactionSeverityEnumLabels,
} from 'src/modules/query-transaction/shared/enums/query-transaction-severity.enum';
import { StringUtil } from 'src/shared/utils/string.util';
import { TSlackBlockDto } from '../dtos/requests/slack-post-message-request.dto';
import { SlackMessageFormatHelper } from './slack-message-format.helper';

export class SlackMessageTemplateHelper {
    static queryTransactionEventAlert(
        project: IProject,
        event: IQueryTransactionEvent,
    ): TSlackBlockDto[] {
        const messages: TSlackBlockDto[] = [];

        // Header
        messages.push({
            type: 'header',
            text: {
                type: 'plain_text',
                text: `${SlackMessageFormatHelper.Emoji('alert')} Slow Query Detected ${SlackMessageFormatHelper.Emoji('alert')}`,
                emoji: true,
            },
        });

        // Divider
        messages.push({
            type: 'divider',
        });

        // Severity Section
        let severityEmoji: string;
        switch (event.severity) {
            case QueryTransactionSeverityEnum.LOW:
                severityEmoji =
                    SlackMessageFormatHelper.Emoji('large_blue_circle');
                break;
            case QueryTransactionSeverityEnum.MEDIUM:
                severityEmoji = SlackMessageFormatHelper.Emoji(
                    'large_yellow_circle',
                );
                break;
            case QueryTransactionSeverityEnum.HIGH:
                severityEmoji = SlackMessageFormatHelper.Emoji(
                    'large_orange_circle',
                );
                break;
            case QueryTransactionSeverityEnum.CRITICAL:
                severityEmoji = SlackMessageFormatHelper.Emoji('red_circle');
                break;
            default:
                severityEmoji =
                    SlackMessageFormatHelper.Emoji('large_blue_circle');
                break;
        }
        messages.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `${SlackMessageFormatHelper.Bold(`Severity ${QueryTransactionSeverityEnumLabels[event.severity]}`)} ${severityEmoji}`,
            },
        });

        // Intro Section
        const textSectionIntro = [
            `${SlackMessageFormatHelper.Bold('Hello Team')} <!channel>, slow query with severity ${event.severity} has been detected in your project. Please review the details below`,
        ].join('\n');

        messages.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: textSectionIntro,
            },
        });

        // Query Section
        const textSectionQuery = [
            `${SlackMessageFormatHelper.Bold('Query:')}`,
            `${SlackMessageFormatHelper.CodeBlock(StringUtil.truncateText(event.rawQuery, 1500))}`,
        ].join('\n');

        messages.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: textSectionQuery,
            },
        });

        if (event.stackTraces && event.stackTraces.length > 0) {
            const textSectionStackTraces = [
                `${SlackMessageFormatHelper.Bold('Stack Traces:')}`,
                `${SlackMessageFormatHelper.CodeBlock(
                    StringUtil.truncateText(event.stackTraces.join('\n')),
                )}`,
            ].join('\n');

            messages.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: textSectionStackTraces,
                },
            });
        }

        // Detail Event Section
        const textSectionDetailEvent = [
            `${SlackMessageFormatHelper.Quoted(`${SlackMessageFormatHelper.Bold('Project:')} ${SlackMessageFormatHelper.Code(project.name)}`)}`,
            `${SlackMessageFormatHelper.Quoted(`${SlackMessageFormatHelper.Bold('Environment:')} ${SlackMessageFormatHelper.Code(event.environment)}`)}`,
            `${SlackMessageFormatHelper.Quoted(`${SlackMessageFormatHelper.Bold('Execution Time:')} ${SlackMessageFormatHelper.Code(event.executionTimeMs + ' ms')}`)}`,
            `${SlackMessageFormatHelper.Quoted(`${SlackMessageFormatHelper.Bold('Query ID:')} ${SlackMessageFormatHelper.Code(event.queryId)}`)}`,
        ].join('\n');

        messages.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: textSectionDetailEvent,
            },
        });

        // Cta Section
        messages.push({
            type: 'actions',
            elements: [
                // {
                //     type: 'button',
                //     text: {
                //         type: 'plain_text',
                //         text: `${SlackMessageFormatHelper.Emoji('eye')} View Details`,
                //         emoji: true,
                //     },
                //     style: 'primary',
                //     action_id: 'btn-view-details',
                //     value: event.queryId,
                // },
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: `${SlackMessageFormatHelper.Emoji('robot_face')} AI Analyze`,
                        emoji: true,
                    },
                    style: 'primary',
                    action_id: 'btn-ai-analyze-query-event',
                    value: event.queryId,
                },
            ],
        });

        return messages;
    }

    static queryTransactionEventAiAnalyzeReport(
        slackUserId: string,
        fileUrl: string,
    ): TSlackBlockDto[] {
        const messages: TSlackBlockDto[] = [];

        // Header
        messages.push({
            type: 'header',
            text: {
                type: 'plain_text',
                text: `${SlackMessageFormatHelper.Emoji('robot_face')} AI Analysis Report ${SlackMessageFormatHelper.Emoji('robot_face')}`,
                emoji: true,
            },
        });

        // Divider
        messages.push({
            type: 'divider',
        });

        // Intro Section
        const textSectionIntro = [
            `${SlackMessageFormatHelper.Bold('Hello')} <@${slackUserId}>, the AI analysis for this query event is complete. Please review the summary and recommendations below with click the button to view more details. The URL button will be active for 24 hours.`,
        ].join('\n');

        messages.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: textSectionIntro,
            },
        });

        // Cta Section
        messages.push({
            type: 'actions',
            elements: [
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: `${SlackMessageFormatHelper.Emoji('eye')} View Details`,
                        emoji: true,
                    },
                    style: 'primary',
                    url: fileUrl,
                },
            ],
        });

        return messages;
    }
}
