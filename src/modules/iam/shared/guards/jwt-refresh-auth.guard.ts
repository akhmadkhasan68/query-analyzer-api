import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthTypeEnum } from '../enums/token-type.enum';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard(
    JwtAuthTypeEnum.RefreshToken,
) {}
