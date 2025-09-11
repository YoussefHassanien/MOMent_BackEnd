import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

const bootstrap = async () => {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix(configService.getOrThrow<string>('globalPrefix'));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.getOrThrow<string>('version'),
  });
  app.use(helmet());
  // app.use(cookieParser(configService.getOrThrow<string>('cookiesSecret')));
  if (configService.getOrThrow<string>('environment') === 'dev') {
    app.enableCors();
    const config = new DocumentBuilder()
      .setTitle('MOMent Project APIs Documentation')
      .setDescription(
        'These APIs are made for MOMent project that mainly serve pregnant women',
      )
      .setVersion('1.0.0')
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

  const port = configService.getOrThrow<number>('port') ?? 3000;
  const globalPrefix = configService.getOrThrow<string>('globalPrefix');
  const version = configService.getOrThrow<string>('version');

  logger.log(
    `Server started at: http://localhost:${port}/${globalPrefix}/v${version}`,
  );
  logger.log(
    `Server docs at: http://localhost:${port}/${globalPrefix}/v${version}/docs`,
  );
};
bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error(
    'Server failed to start',
    error instanceof Error ? error.stack : String(error),
  );
});
