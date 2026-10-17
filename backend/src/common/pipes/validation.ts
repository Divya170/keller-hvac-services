import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

/**
 * Global validation pipe. Field errors are returned as `{ message, errors: { field: message } }`
 * so every form on the frontend can show messages next to the right input.
 */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (validationErrors: ValidationError[]) => {
      const errors: Record<string, string> = {};
      const walk = (list: ValidationError[], prefix = '') => {
        for (const e of list) {
          const key = prefix ? `${prefix}.${e.property}` : e.property;
          // Decorators run bottom-up, so the last constraint is the top-most (most basic) rule.
          if (e.constraints) { const msgs = Object.values(e.constraints); errors[key] = msgs[msgs.length - 1]; }
          if (e.children?.length) walk(e.children, key);
        }
      };
      walk(validationErrors);
      return new BadRequestException({ message: 'Please check the highlighted fields.', errors });
    },
  });
}
