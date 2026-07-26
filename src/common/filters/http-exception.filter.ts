import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    
    // Get the original error response body from NestJS
    const exceptionResponse = exception.getResponse();
    
    // Determine message
    let message = exception.message;
    if (typeof exceptionResponse === 'object' && (exceptionResponse as any).message) {
      const msg = (exceptionResponse as any).message;
      message = Array.isArray(msg) ? msg[0] : msg; // Validation errors are arrays
    }

    // Determine custom error code
    let code = 'INTERNAL_ERROR';
    if (typeof exceptionResponse === 'object' && (exceptionResponse as any).code) {
      code = (exceptionResponse as any).code;
    } else {
      // Map HTTP status to default custom codes
      switch(status) {
        case HttpStatus.UNAUTHORIZED:
          code = message.toLowerCase().includes('expired') ? 'TOKEN_EXPIRED' : 'UNAUTHORIZED';
          if (message.toLowerCase().includes('credential')) code = 'INVALID_CREDENTIALS';
          break;
        case HttpStatus.FORBIDDEN:
          code = 'FORBIDDEN';
          break;
        case HttpStatus.BAD_REQUEST:
          code = 'BAD_REQUEST';
          break;
        case HttpStatus.NOT_FOUND:
          code = 'NOT_FOUND';
          break;
        case HttpStatus.CONFLICT:
          code = 'CONFLICT';
          break;
      }
    }

    response
      .status(status)
      .json({
        status: 'error',
        statusCode: status,
        message: message,
        error: {
          code: code
        }
      });
  }
}
