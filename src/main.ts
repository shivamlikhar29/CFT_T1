import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.useStaticAssets(path.join(__dirname , "uploads"));
  app.use('/uploads', express.static(path.join(process.env.PWD, 'uploads')));
  app.useGlobalPipes(new ValidationPipe({whitelist: true}));
  app.use(cookieParser())
  await app.listen(3000);
}
bootstrap();
  