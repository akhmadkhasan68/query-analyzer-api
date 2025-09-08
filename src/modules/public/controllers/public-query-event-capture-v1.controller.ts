import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { IProjectKey } from "src/infrastructures/databases/entities/interfaces/project-key.interface";
import { ProjectKey } from "src/modules/iam/shared/decorators/project-key.decorator";
import { ExcludeGlobalGuard } from "src/modules/iam/shared/decorators/public.decorator";
import { ProjectApiKeyGuard } from "src/modules/iam/shared/guards/project-api-key.guard";
import { IBasicResponse } from "src/shared/interfaces/basic-response.interface";
import { PublicQueryEventCaptureV1Request } from "../dtos/requests/public-query-event-capture-create-v1.request";
import { PublicQueryEventCaptureV1Service } from "../services/public-query-event-capture-v1.service";

@Controller({
    path: 'public/query-event-captures',
    version: '1',
})
@ExcludeGlobalGuard()
@UseGuards(ProjectApiKeyGuard)
export class PublicQueryEventCaptureV1Controller {
    constructor(
        private readonly publicQueryEventCaptureV1Service: PublicQueryEventCaptureV1Service
    ) {}

    @Post()
    async capture(
        @Body() body: PublicQueryEventCaptureV1Request,
        @ProjectKey() projectKey: IProjectKey,
    ): Promise<IBasicResponse<any>> {
        await this.publicQueryEventCaptureV1Service.capture(body, projectKey);

        return {
            data: null,
            message: 'Query event captured successfully',
        };       
    }
}