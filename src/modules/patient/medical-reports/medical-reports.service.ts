import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../../../services/cloudinary.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class MedicalReportsService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}
  create(createReportDto: CreateReportDto) {
    return 'This action adds a new labRadReportsUpload';
  }

  findAll() {
    return `This action returns all labRadReportsUpload`;
  }

  findOne(id: number) {
    return `This action returns a #${id} labRadReportsUpload`;
  }

  remove(id: number) {
    return `This action removes a #${id} labRadReportsUpload`;
  }
}
