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
    // let message = exception.message;
    let userMessage = 'An error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
    } else if (exception.name === 'CastError') {
      status = HttpStatus.BAD_REQUEST;
      this.logger.error(`CastError: ${exception.message}`);
      userMessage = 'Invalid data format';
    }

    response.status(status).json({
      statusCode: status,
      message: userMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
