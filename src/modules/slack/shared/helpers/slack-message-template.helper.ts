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
                text: ':alert: Slow Query Detected :alert:',
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
            `${StringUtil.truncateText(SlackMessageFormatHelper.CodeBlock(event.rawQuery))}`,
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
                    event.stackTraces.join('\n'),
                )}`,
            ].join('\n');

            messages.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: StringUtil.truncateText(textSectionStackTraces),
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
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: `${SlackMessageFormatHelper.Emoji('eye')} View Details`,
                        emoji: true,
                    },
                    url: 'https://app.queryanalyzer.com/', //TODO: Implement AI Analyze functionality
                    style: 'primary',
                },
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: `${SlackMessageFormatHelper.Emoji('mag')} AI Analyze`,
                        emoji: true,
                    },
                    url: 'https://app.queryanalyzer.com/', //TODO: Implement AI Analyze functionality
                },
            ],
        });

        return messages;
    }
}
