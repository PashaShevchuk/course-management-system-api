import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const port = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    app.enableCors();
  }

  if (process.env.PREFIX_PATH) {
    app.setGlobalPrefix(process.env.PREFIX_PATH);
  }

  const config = new DocumentBuilder()
    .setTitle('Course Management System API')
    .setDescription('The API description')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const path = process.env.PREFIX_PATH
    ? `${process.env.PREFIX_PATH}/docs`
    : 'docs';
  SwaggerModule.setup(path, app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port, () =>
    console.log(`The server is listening on the port ${port}`),
  );
}

bootstrap();
