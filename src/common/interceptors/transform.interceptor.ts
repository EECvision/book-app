import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE } from '../decorators/response-message.decorator';

export interface Response<T> {
  status: string;
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    // Get the custom message if one was set via @ResponseMessage()
    const message = this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) || 'Request successful';

    return next.handle().pipe(
      map(data => ({
        status: 'success',
        statusCode,
        message,
        data,
      })),
    );
  }
}
