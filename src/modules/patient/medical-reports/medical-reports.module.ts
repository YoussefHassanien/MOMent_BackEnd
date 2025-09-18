import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalReport, Patient } from '../../../database';
import { CloudinaryService } from '../../../services/cloudinary.service';
import { MedicalReportsController } from './medical-reports.controller';
import { MedicalReportsService } from './medical-reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalReport, Patient])],
  controllers: [MedicalReportsController],
  providers: [MedicalReportsService, CloudinaryService],
})
export class MedicalReportsModule {}
