import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailSendDto } from '../../mail/dto/mail-send.dto';
import { MailService } from '../../mail/services/mail.service';
import { QUEUE_NAME } from '../constants/queue-name.constant';

@Processor(QUEUE_NAME.Mail)
export class QueueMailProcessor extends WorkerHost {
    constructor(private readonly mailService: MailService) {
        super();
    }

    async process(job: Job<MailSendDto>, token?: string): Promise<void> {
        try {
            const { to, subject, template, context } = job.data;

            await this.mailService.sendMail({
                to,
                subject,
                template,
                context,
            });
        } catch (error) {
            console.error(`Error processing job: ${error.message}`);
            throw new Error(`Failed to process job: ${error.message}`);
        }
    }
}
