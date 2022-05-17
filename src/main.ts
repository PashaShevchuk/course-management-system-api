import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV !== 'production') {
    app.enableCors();
  }

  if (process.env.PREFIX_PATH) {
    app.setGlobalPrefix(process.env.PREFIX_PATH);
  }

  await app.listen(port, () =>
    console.log(`The server is listening on the port ${port}`),
  );
}

bootstrap();
