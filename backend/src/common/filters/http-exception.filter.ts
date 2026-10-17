import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

/**
 * Normalises every error into `{ statusCode, message, errors? }` and hides internals
 * of unexpected failures from clients.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      let message = exception.message;
      let errors: Record<string, string> | undefined;
      if (typeof body === 'object' && body) {
        const b = body as { message?: string | string[]; errors?: Record<string, string> };
        if (Array.isArray(b.message)) message = b.message.join(' ');
        else if (b.message) message = b.message;
        errors = b.errors;
      } else if (typeof body === 'string') {
        message = body;
      }
      res.status(status).json({ statusCode: status, message, ...(errors ? { errors } : {}) });
      return;
    }

    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong on our side. Please try again.',
    });
  }
}
