import { Module } from '@nestjs/common';
import { CloudinaryService } from '../../../services/cloudinary.service';
import { MedicalReportsController } from './medical-reports.controller';
import { MedicalReportsService } from './medical-reports.service';

@Module({
  controllers: [MedicalReportsController],
  providers: [MedicalReportsService, CloudinaryService],
})
export class MedicalReportsModule {}
