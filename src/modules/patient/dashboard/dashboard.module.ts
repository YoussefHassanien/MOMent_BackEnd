import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient, VitalSign, VitalSignType } from '../../../database';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([VitalSign, VitalSignType, Patient])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
