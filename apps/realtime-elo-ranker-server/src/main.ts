/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: [
    'http://localhost:3000', //allow local postman client
    'http://localhost:3001', // allow local swagger
    'http://151.80.147.102:3001', // allow vps swagger (online)
    'http://localhost:3002', // allow local frontend dev server
  ] 
  }); // allow Postman client, swagger local, and vps swagger
  app.useGlobalPipes(new ValidationPipe({transform: true}));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
