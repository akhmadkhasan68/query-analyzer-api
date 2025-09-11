import { IProjectKey } from 'src/infrastructures/databases/entities/interfaces/project-key.interface';
import { IProject } from 'src/infrastructures/databases/entities/interfaces/project.interface';
import { QueryTransactionEventCaptureV1Request } from 'src/modules/query-transaction/dtos/requests/query-transaction-event-capture-v1.request';

export class QueueQueryTransactionEventDto extends QueryTransactionEventCaptureV1Request {
    project: IProject;
    projectKey: IProjectKey;
}
