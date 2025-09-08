import { MailTemplateFileEnum } from '../enums/mail-template-file.enum';

export class MailSendDto {
    to: string;
    subject: string;
    template: MailTemplateFileEnum;
    context: Record<string, any>;
}
