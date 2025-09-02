import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('MOMent Project APIs Documentation')
    .setDescription(
      'These APIs are made for MOMent project that mainly serve pregnant women',
    )
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then(() => console.log('Server started at: http://localhost:3000'))
  .catch(() => {
    console.log('Server failed to start');
  });
