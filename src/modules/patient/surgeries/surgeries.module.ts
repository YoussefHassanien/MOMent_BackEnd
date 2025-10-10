import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient, Surgery } from '../../../database';
import { SurgeriesController } from './surgeries.controller';
import { SurgeriesService } from './surgeries.service';

@Module({
  imports: [TypeOrmModule.forFeature([Surgery, Patient])],
  controllers: [SurgeriesController],
  providers: [SurgeriesService],
})
export class SurgeriesModule {}
