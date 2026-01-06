import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OTP, Patient, PatientMedicine, User } from '../database';
import { EmailService } from '../services/email.service';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([OTP, PatientMedicine, Patient, User])],
  providers: [TasksService, EmailService],
  exports: [TasksService],
})
export class TasksModule {}
