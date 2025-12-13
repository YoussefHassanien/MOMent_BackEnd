import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OTP, PatientMedicine, Patient, User } from '../database';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { EmailService } from '../services/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([OTP, PatientMedicine, Patient, User])],
  controllers: [TasksController],
  providers: [TasksService, EmailService],
  exports: [TasksService],
})
export class TasksModule {}
