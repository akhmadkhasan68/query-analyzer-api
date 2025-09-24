import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailSendDto } from '../../mail/dto/mail-send.dto';
import { MailService } from '../../mail/services/mail.service';
import { QueueMailJob, QueueName } from '../constants/queue-name.constant';

@Processor(QueueName.Mail)
export class QueueMailProcessor extends WorkerHost {
    constructor(private readonly mailService: MailService) {
        super();
    }

    async process(job: Job, _token?: string): Promise<void> {
        try {
            const jobName = job.name;

            switch (jobName) {
                case QueueMailJob.SendMail: {
                    const { to, subject, template, context } =
                        job.data as MailSendDto;

                    await this.mailService.sendMail({
                        to,
                        subject,
                        template,
                        context,
                    });

                    break;
                }
                default:
                    throw new Error(`Unknown job name: ${jobName}`);
            }
        } catch (error) {
            // console.error(`Error processing job: ${error.message}`);
            throw new Error(`Failed to process job: ${error.message}`);
        }
    }
}
