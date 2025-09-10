import { Module } from '@nestjs/common';
import { LabRadReportsUploadController } from './lab-rad-reports-upload.controller';
import { LabRadReportsUploadService } from './lab-rad-reports-upload.service';

@Module({
  controllers: [LabRadReportsUploadController],
  providers: [LabRadReportsUploadService],
})
export class LabRadReportsUploadModule {}
