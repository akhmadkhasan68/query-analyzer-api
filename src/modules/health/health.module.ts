import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthV1Controller } from './controllers/health-v1.controller';

@Module({
    imports: [TerminusModule, HttpModule],
    controllers: [HealthV1Controller],
})
export class HealthModule {}
