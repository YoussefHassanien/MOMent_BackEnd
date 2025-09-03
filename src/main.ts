import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableVersioning();
  app.use(helmet());
  app.use(cookieParser(process.env.COOKIES_SECRET));
  if (process.env.ENVIRONMENT === 'dev') {
    app.enableCors();
    app.use(morgan('dev'));
    const config = new DocumentBuilder()
      .setTitle('MOMent Project APIs Documentation')
      .setDescription(
        'These APIs are made for MOMent project that mainly serve pregnant women',
      )
      .setVersion('1.0.0')
      .addBearerAuth()
      .addCookieAuth()
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(
      `api/v${process.env.VERSION}/docs`,
      app,
      documentFactory,
    );
  }

  await app.listen(process.env.SERVER_PORT ?? 3000);
}
bootstrap()
  .then(() =>
    console.log(
      `Server started at: http://localhost:${process.env.SERVER_PORT ?? 3000}/api/v${process.env.VERSION}`,
      `\nServer docs at: http://localhost:${process.env.SERVER_PORT ?? 3000}/api/v1/docs`,
    ),
  )
  .catch((error) => {
    console.log('Server failed to start', error);
  });
