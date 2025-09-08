import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUserToken } from 'src/infrastructures/databases/entities/interfaces/user-token.interface';
import { UserToken } from 'src/infrastructures/databases/entities/user-token.entity';
import { UserTokenTypeEnum } from 'src/shared/enums/user-token.enum';
import { Repository } from 'typeorm';

@Injectable()
export class UserTokenV1Repository extends Repository<IUserToken> {
    constructor(
        @InjectRepository(UserToken)
        private readonly repo: Repository<IUserToken>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    private readonly defaultRelations: string[] = ['user'];

    async findOneByIdAndTypeWithRelations(
        id: string,
        type: UserTokenTypeEnum,
        relations?: string[],
    ): Promise<IUserToken | null> {
        return this.repo.findOne({
            where: { id, type },
            relations: relations || this.defaultRelations,
        });
    }

    async findOneByTokenAndTypeWithRelations(
        token: string,
        type: UserTokenTypeEnum,
        relations?: string[],
    ): Promise<IUserToken | null> {
        return this.repo.findOne({
            where: { token, type },
            relations: relations || this.defaultRelations,
        });
    }
}
