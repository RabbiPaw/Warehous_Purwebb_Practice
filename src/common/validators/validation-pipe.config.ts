import { BadRequestException, ValidationError, ValidationPipeOptions } from '@nestjs/common';

export function formatValidationErrorDeeply(error: ValidationError): any {
  const { value, target, ...restError } = error;
  const res = restError;

  if (restError.children && restError.children.length > 0) {
    res.children = restError.children.map(formatValidationErrorDeeply);
  }

  return res;
}

export function handleValidationErrors(
  errors: ValidationError[],
  options?: { statusCode?: number; error?: string; message?: string },
): BadRequestException {
  return new BadRequestException({
    statusCode: options?.statusCode ?? 400,
    error: options?.error ?? 'Bad Request',
    message: options?.message ?? 'Validation failed',
    errors: errors.map(formatValidationErrorDeeply),
  });
}

export const VALIDATION_PIPE_OPTIONS: ValidationPipeOptions = {
  skipMissingProperties: false,
  whitelist: true,
  forbidNonWhitelisted: true,
  validationError: {
    target: false,
    value: false,
  },
  exceptionFactory: handleValidationErrors,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
};