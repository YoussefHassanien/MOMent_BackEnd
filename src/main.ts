import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix(configService.getOrThrow<string>('globalPrefix'));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.getOrThrow<string>('version'),
  });
  app.use(helmet());
  app.use(cookieParser(configService.getOrThrow<string>('cookiesSecret')));
  if (configService.getOrThrow<string>('environment') === 'dev') {
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
      `${configService.getOrThrow<string>('globalPrefix')}/v${configService.getOrThrow<string>('version')}/docs`,
      app,
      documentFactory,
    );
  }
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(configService.getOrThrow<number>('port') ?? 3000);
}
bootstrap()
  .then(() => {
    console.log(
      `Server started at: http://localhost:${process.env.PORT ?? 3000}/${process.env.GLOBAL_PREFIX}/v${process.env.VERSION}`,
      `\nServer docs at: http://localhost:${process.env.PORT ?? 3000}/${process.env.GLOBAL_PREFIX}/v${process.env.VERSION}/docs`,
    );
  })
  .catch((error) => {
    console.log('Server failed to start', error);
  });
