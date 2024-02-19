import {
  Logger,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let userMessage = 'An error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      userMessage =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : Array.isArray((exceptionResponse as any).message)
            ? (exceptionResponse as any).message[0]
            : (exceptionResponse as any).message || 'A request error occurred';
    } else if (exception.name === 'CastError') {
      status = HttpStatus.BAD_REQUEST;
      this.logger.error(`CastError: ${exception.message}`);
      userMessage = 'Invalid data format';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      userMessage = 'Unexpected error occurred';
    }

    this.logger.error(`${exception.name}: ${exception.message}`);

    response.status(status).json({
      statusCode: status,
      message: userMessage,
      error: exception.name,
      errorDetail: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
