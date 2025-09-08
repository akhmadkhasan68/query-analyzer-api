import { HttpException } from '@nestjs/common';

export class DataNotFoundException extends HttpException {
    constructor(message: string = 'Data not found') {
        super(message, 404);
    }
}
