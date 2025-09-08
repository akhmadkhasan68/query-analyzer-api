import { IUser } from 'src/infrastructures/databases/entities/interfaces/user.interface';
import { ITokenResultData } from './token-result-data.interface';

export interface IAuthResultData {
    user: IUser;
    token: ITokenResultData;
}
