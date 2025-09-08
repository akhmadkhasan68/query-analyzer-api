import { Injectable } from "@nestjs/common";
import { IProjectKey } from "src/infrastructures/databases/entities/interfaces/project-key.interface";
import { QueryTransactionV1Service } from "src/modules/query-transaction/services/query-transaction-v1.service";
import { PublicQueryEventCaptureV1Request } from "../dtos/requests/public-query-event-capture-create-v1.request";

@Injectable()
export class PublicQueryEventCaptureV1Service {
    constructor(
        private readonly queryTransactionV1Service: QueryTransactionV1Service,
    ) {}

    async capture(
        body: PublicQueryEventCaptureV1Request,
        projectKey: IProjectKey,
    ): Promise<void> {
        // Save the query event capture data to the database
    }
}