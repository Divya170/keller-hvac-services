import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { createValidationPipe } from './common/pipes/validation';
import { AppConfig } from './config/configuration';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const cfg = app.get(ConfigService).get<AppConfig>('app')!;

  app.setGlobalPrefix('api');
  app.set('trust proxy', 'loopback');
  app.disable('x-powered-by');
  app.use(cookieParser());
  app.useBodyParser('json', { limit: '200kb' });
  app.useGlobalPipes(createValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({ origin: cfg.frontendOrigin, credentials: true });
  app.enableShutdownHooks();

  await app.listen(cfg.port);
  Logger.log(`API ready on http://localhost:${cfg.port}/api  (db: ${cfg.databasePath})`, 'Bootstrap');
}

bootstrap();
