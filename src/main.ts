import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from './config/config.service';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService)

  const baseUrl1 = configService.getFrontEndBaseUrl1();
  const baseUrl2 = configService.getFrontEndBaseUrl2();

  app.use(cors({
    origin: [
      baseUrl1,
      baseUrl2
    ],
    credentials: true,
  }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 8004);
}
bootstrap();
