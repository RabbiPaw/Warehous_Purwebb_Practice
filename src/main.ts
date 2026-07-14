import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { VALIDATION_PIPE_OPTIONS } from './common/validators/validation-pipe.config';
import { PinoLogger } from './common/logger/pino-logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  const configService = app.get(ConfigService);
  const logger = app.get(PinoLogger);

  // Fastify plugins
  await app.register(fastifyHelmet);
  await app.register(fastifyCors, {
    origin: configService.get<string>('CORS_ORIGIN') || '*',
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS));
  app.setGlobalPrefix('api');

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Warehouse Management API')
    .setDescription('REST API for warehouse management system')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management (admin only)')
    .addTag('products', 'Product management')
    .addTag('suppliers', 'Supplier management')
    .addTag('distributions', 'Distribution operations')
    .addTag('warehouse', 'Warehouse settings')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Start server
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`Server running on: http://localhost:${port}`);
  logger.log(`Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();