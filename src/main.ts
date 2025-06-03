import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true }));
  
  // Налаштування CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Твій фронтенд
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Для підтримки cookies
  });

  // ДОДАЙТЕ ЦЕЙ РЯДОК
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(1488); // Порт бекенду
}
bootstrap();