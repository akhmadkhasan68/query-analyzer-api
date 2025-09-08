import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { MailSendDto } from '../dto/mail-send.dto';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(private readonly mailerService: MailerService) {}

    async sendMail(mailSendDto: MailSendDto): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: mailSendDto.to,
                subject: mailSendDto.subject,
                template: mailSendDto.template,
                context: mailSendDto.context,
            });
            this.logger.log(
                `Email sent to ${mailSendDto.to} with subject "${mailSendDto.subject}"`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to send email to ${mailSendDto.to}: ${error.message}`,
            );

            throw error;
        }
    }
}
