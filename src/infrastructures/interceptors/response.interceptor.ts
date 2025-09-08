import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { config } from 'src/config';
import { DateTimeUtil } from 'src/shared/utils/datetime.util';
import { StringUtil } from 'src/shared/utils/string.util';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest() as Request;

        return next.handle().pipe(
            map((data) => {
                if (data?.data) {
                    data.data = StringUtil.snakeCaseKey(data.data);
                    data.data = DateTimeUtil.parseDatetime(
                        data.data,
                        request.headers['timezone'] != undefined
                            ? request.headers['timezone']?.toString()
                            : config.app.tz,
                    );
                }

                if (data?.meta) {
                    data.meta = StringUtil.snakeCaseKey(data.meta);
                    data.meta = DateTimeUtil.parseDatetime(
                        data.meta,
                        request.headers['timezone'] != undefined
                            ? request.headers['timezone']?.toString()
                            : config.app.tz,
                    );
                }

                return data;
            }),
        );
    }
}
