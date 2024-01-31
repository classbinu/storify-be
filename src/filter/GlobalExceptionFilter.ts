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
      userMessage = 'A request error occurred';
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
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
