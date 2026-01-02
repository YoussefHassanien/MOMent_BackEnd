import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { Environment } from './constants/enums';

const bootstrap = async () => {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger:
      process.env.ENVIRONMENT === Environment.PROD
        ? ['warn', 'error', 'fatal']
        : ['debug', 'error', 'fatal', 'log', 'verbose', 'warn'],
  });
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('port');
  const globalPrefix = configService.getOrThrow<string>('globalPrefix');
  const version = configService.getOrThrow<string>('version');
  const environment = configService.getOrThrow<Environment>('environment');

  app.setGlobalPrefix(globalPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: version,
  });
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (environment === Environment.DEV) {
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
      `${globalPrefix}/v${version}/docs`,
      app,
      documentFactory,
    );
  } else if (environment === Environment.PROD) {
    app.enableCors({
      origin: configService.getOrThrow<string>('audience'),
      methods: configService.getOrThrow<string[]>('methods'),
      allowedHeaders: configService.getOrThrow<string[]>('allowedHeaders'),
      credentials: configService.getOrThrow<boolean>('credentials'),
    });
  }

  await app.listen(port);

  const appUrl = await app.getUrl();
  logger.log(`Server started at: ${appUrl}/${globalPrefix}/v${version}`);
};

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error(
    'Server failed to start',
    error instanceof Error ? error.stack : String(error),
  );
});
