import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IProjectKey } from 'src/infrastructures/databases/entities/interfaces/project-key.interface';
import { HashUtil } from 'src/shared/utils/hash.util';
import { StringUtil } from 'src/shared/utils/string.util';
import { ProjectKeyV1Repository } from '../repositories/project-key-v1.repository';
import { ProjectV1Repository } from '../repositories/project-v1.repository';
import { IPaginateData } from '../../../shared/interfaces/paginate-response.interface';
import { ProjectKeyPaginateV1Request } from '../dtos/requests/project-key-paginate-v1.request';
import { ProjectKeyCreateV1Request } from '../dtos/requests/project-key-create-v1.request';

@Injectable()
export class ProjectKeyV1Service {
    constructor(
        private readonly projectV1Repository: ProjectV1Repository,
        private readonly projectKeyV1Repository: ProjectKeyV1Repository,
    ) {}

    private readonly PREFIX_KEY_TEST = 'qm_test_'; // TODO: for future use
    private readonly PREFIX_KEY_LIVE = 'qm_live_';

    public async validateKeyPlain(
        plainKey: string,
        projectId: string,
    ): Promise<IProjectKey | null> {
        const projectKey =
            await this.projectKeyV1Repository.findOneByPlainKeyAndProjectId(
                plainKey,
                projectId,
            );

        return projectKey;
    }

    public async createProjectDefaultKey(): Promise<IProjectKey> {
        // Generate Key Pair
        const { plainKey, hashedKey, maskedKey } = await this.generateKeyPair();

        const createdProjectKey = this.projectKeyV1Repository.create({
            name: StringUtil.convertToTitleCase('Default Key'),
            hashedKey: hashedKey,
            maskedKey: maskedKey,
        });

        (createdProjectKey as any).plainKey = plainKey;

        return createdProjectKey;
    }

    private async generateKeyPair(): Promise<{
        plainKey: string;
        hashedKey: string;
        maskedKey: string;
    }> {
        // Implement key pair generation logic here
        const plainKey = this.generatePlainKey();
        const hashedKey = await this.generateHashedKey(plainKey);
        const maskedKey = this.generateMaskedKey(plainKey);

        return { plainKey, hashedKey, maskedKey };
    }

    private generatePlainKey() {
        // TODO: Implement prefix live or test based on environment or input
        const prefix = this.PREFIX_KEY_LIVE;
        const randomBytes = crypto.randomBytes(24).toString('hex');

        return `${prefix}${randomBytes}`;
    }

    private async generateHashedKey(plainKey: string): Promise<string> {
        return await HashUtil.hashBcrypt(plainKey);
    }

    private generateMaskedKey(plainKey: string): string {
        const minimumKeyLength = 8;
        if (plainKey.length <= minimumKeyLength) {
            return plainKey; // Not enough length to mask
        }

        return StringUtil.maskedString(plainKey, 4, 4);
    }

    async paginate(
        projectId: string,
        paginationDto: ProjectKeyPaginateV1Request,
    ): Promise<IPaginateData<IProjectKey>> {
        return await this.projectKeyV1Repository.paginate(
            projectId,
            paginationDto,
        );
    }

    async create(dto: ProjectKeyCreateV1Request): Promise<IProjectKey> {
        const { plainKey, hashedKey, maskedKey } = await this.generateKeyPair();
        const project = await this.projectV1Repository.findOneByOrFail({
            id: dto.projectId,
        });

        const createdProjectKey = this.projectKeyV1Repository.create({
            name: dto.name,
            hashedKey: hashedKey,
            maskedKey: maskedKey,
            project: project,
        });

        (createdProjectKey as any).plainKey = plainKey;

        return this.projectKeyV1Repository.save(createdProjectKey);
    }

    async delete(id: string | string[]): Promise<void> {
        await this.projectKeyV1Repository.delete(id);
    }
}
