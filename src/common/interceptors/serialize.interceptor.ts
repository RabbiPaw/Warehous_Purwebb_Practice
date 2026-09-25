import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private readonly dto: any) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        // Если данные — это массив
        if (Array.isArray(data)) {
          return data.map((item) => {
            if (item && typeof item === 'object') {
              return plainToInstance(this.dto, item, {
                excludeExtraneousValues: true,
              });
            }
            return item;
          });
        }

        // Если данные — это объект с полем data (пагинация)
        if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
          return {
            ...data,
            data: data.data.map((item: any) => {
              if (item && typeof item === 'object') {
                return plainToInstance(this.dto, item, {
                  excludeExtraneousValues: true,
                });
              }
              return item;
            }),
          };
        }

        // Если данные — это один объект
        if (data && typeof data === 'object') {
          return plainToInstance(this.dto, data, {
            excludeExtraneousValues: true,
          });
        }

        return data;
      }),
    );
  }
}