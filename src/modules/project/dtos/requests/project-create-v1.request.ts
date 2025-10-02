import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';
import { ProjectStatusEnum } from '../../shared/enums/project-status.enum';

const ProjectGitlabCreateV1Schema = z.object({
    projectId: z.number().optional(),
    url: z.string().url().optional(),
    groupId: z.number().optional(),
    groupName: z.string().optional(),
    defaultBranch: z.string().optional(),
    visibility: z.string().optional(),
});

const ProjectSlackChannelCreateV1Schema = z.object({
    slackChannelId: z.string().optional(),
});

export const ProjectCreateV1Schema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    status: z
        .nativeEnum(ProjectStatusEnum)
        .optional()
        .default(ProjectStatusEnum.ACTIVE),
    platformId: z
        .string({
            required_error: 'Platform ID is required',
        })
        .uuid(),
    gitlab: ProjectGitlabCreateV1Schema.optional(),
    slackChannel: ProjectSlackChannelCreateV1Schema.optional(),
});

export const ProjectDeleteByIdsV1Schema = z.object({
    ids: z.array(z.string()),
});

export const ProjectUpdateV1Schema = ProjectCreateV1Schema;

export class ProjectCreateV1Request extends ZodUtils.createCamelCaseDto(
    ProjectCreateV1Schema,
) {}

export class ProjectUpdateV1Request extends ZodUtils.createCamelCaseDto(
    ProjectUpdateV1Schema,
) {}

export class ProjectDeleteByIdsV1Request extends ZodUtils.createCamelCaseDto(
    ProjectDeleteByIdsV1Schema,
) {}
