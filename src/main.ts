import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe);

  // Налаштування CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Твій фронтенд
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Для підтримки cookies
  });

  await app.listen(1488); // Порт бекенду
}
bootstrap();