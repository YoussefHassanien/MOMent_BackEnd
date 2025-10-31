import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Education } from '../../../database';
import { EducationService } from './education.service';
import { EducationController } from './education.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Education])],
  controllers: [EducationController],
  providers: [EducationService],
})
export class EducationModule {}
