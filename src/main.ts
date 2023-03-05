import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
        whitelist: true, // Обрезать лишние данные, которые не в DTO
        forbidNonWhitelisted: true, // Выдать ошибку, если будут лишние данные
    }),
    );
  const PORT = process.env.PORT;
  await app.listen(PORT, () => console.log(`Started at ${PORT}`));
}
bootstrap();
