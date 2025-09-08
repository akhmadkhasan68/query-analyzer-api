import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from 'src/infrastructures/databases/entities/platform.entity';
import { PlatformV1Repository } from './repositories/platform-v1.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Platform])],
    controllers: [],
    providers: [
        // Repositories
        PlatformV1Repository,
    ],
    exports: [PlatformV1Repository],
})
export class PlatformModule {}
