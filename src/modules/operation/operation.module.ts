import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Operation } from 'src/infrastructures/databases/entities/operation.entity';
import { OperationV1Controller } from './controllers/operation-v1.controller';
import { OperationV1Repository } from './repositories/operation-v1.repository';
import { OperationV1Service } from './services/operation-v1.service';

@Module({
    imports: [TypeOrmModule.forFeature([Operation])],
    controllers: [OperationV1Controller],
    providers: [OperationV1Repository, OperationV1Service],
    exports: [OperationV1Repository, OperationV1Service],
})
export class OperationModule {}
