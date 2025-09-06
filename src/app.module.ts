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
    // Add global middleware here if needed
    // Example: consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
