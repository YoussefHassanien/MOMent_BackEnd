import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule, minutes } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import config from './config/config';
import { validate } from './config/validation';
import { dataSourceAsyncOptions } from './database/orm.config';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { VitalSignTypeModule } from './modules/admin/vital-sign-type/vital-sign-type.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/patient/dashboard/dashboard.module';
import { DrugInteractionsModule } from './modules/patient/drug-interactions/drug-interactions.module';
import { MedicalReportsModule } from './modules/patient/medical-reports/medical-reports.module';
import { SurgeriesModule } from './modules/patient/surgeries/surgeries.module';
import { VitalSignsModule } from './modules/patient/vital-signs/vital-signs.module';
import { TasksModule } from './tasks/tasks.module';
import { FoodDrugAllergiesModule } from './modules/patient/food-drug-allergies/food-drug-allergies.module';
import { MedicinesModule } from './modules/patient/medicines/medicines.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      cache: true,
      validate,
      validationOptions: {
        allowUnknown: false,
        abortEarly: true,
      },
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
    AuthModule,
    VitalSignsModule,
    VitalSignTypeModule,
    TasksModule,
    MedicalReportsModule,
    SurgeriesModule,
    DashboardModule,
    DrugInteractionsModule,
    FoodDrugAllergiesModule,
    MedicinesModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  private readonly logger = new Logger(AppModule.name);
  constructor(private readonly dataSource: DataSource) {
    const connectionStatus: string = this.dataSource.isInitialized
      ? 'succeeded'
      : 'failed';
    this.logger.log(`Database connection ${connectionStatus}`);
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*path');
  }
}
