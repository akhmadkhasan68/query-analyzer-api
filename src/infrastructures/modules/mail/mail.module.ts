import { Module } from '@nestjs/common';
import { HttpModule } from 'nestjs-http-promise';
import { MailService } from './services/mail.service';

@Module({
    imports: [
        HttpModule.register({
            timeout: 60000,
            retries: 5,
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
