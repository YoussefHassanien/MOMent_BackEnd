import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OTP } from '../database';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([OTP])],
  providers: [TasksService],
})
export class TasksModule {}
