import { Module } from '@nestjs/common';
import { LogActivityV1Controller } from './controllers/log-activity-v1.controller';
import { LogActivityV1Repository } from './repositories/log-activity-v1.repository';
import { LogActivityV1Service } from './services/log-activity-v1.service';

@Module({
    imports: [],
    controllers: [LogActivityV1Controller],
    providers: [LogActivityV1Service, LogActivityV1Repository],
    exports: [],
})
export class LogActivityModule {}
