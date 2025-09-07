import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard, minutes } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { DataSource } from 'typeorm';
import { dataSourceAsyncOptions } from './database/orm.config';
import config from './config/config';
import { EmailModule } from './services/email/email.module';
import { VitalSignsModule } from './modules/patient/vital-signs/vital-signs.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { VitalSignTypeModule } from './modules/admin/vital-sign-type/vital-sign-type.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRootAsync(dataSourceAsyncOptions),
    ThrottlerModule.forRoot([
      {
        ttl: minutes(2),
        limit: 50,
        blockDuration: minutes(1),
      },
    ]),
    ScheduleModule.forRoot(),
    EmailModule,
    AuthModule,
    VitalSignsModule,
    VitalSignTypeModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  constructor(private readonly dataSource: DataSource) {
    const connectionStatus: string = this.dataSource.isInitialized
      ? 'succeeded'
      : 'failed';
    console.log(`Database connection ${connectionStatus}`);
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
