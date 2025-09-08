import { Module } from "@nestjs/common";
import { IamModule } from "../iam/iam.module";
import { QueryTransactionModule } from "../query-transaction/query-transaction.module";
import { PublicQueryEventCaptureV1Controller } from "./controllers/public-query-event-capture-v1.controller";
import { PublicQueryEventCaptureV1Service } from "./services/public-query-event-capture-v1.service";

@Module({
    imports: [
        IamModule,
        QueryTransactionModule
    ],
    controllers: [PublicQueryEventCaptureV1Controller],
    providers: [
        PublicQueryEventCaptureV1Service
    ],
    exports: [],
})
export class PublicModule {}