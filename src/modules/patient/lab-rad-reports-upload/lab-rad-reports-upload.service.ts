import { Injectable } from '@nestjs/common';
import { CreateLabRadReportsUploadDto } from './dto/create-lab-rad-reports-upload.dto';
import { UpdateLabRadReportsUploadDto } from './dto/update-lab-rad-reports-upload.dto';

@Injectable()
export class LabRadReportsUploadService {
  create(createLabRadReportsUploadDto: CreateLabRadReportsUploadDto) {
    return 'This action adds a new labRadReportsUpload';
  }

  findAll() {
    return `This action returns all labRadReportsUpload`;
  }

  findOne(id: number) {
    return `This action returns a #${id} labRadReportsUpload`;
  }

  update(
    id: number,
    updateLabRadReportsUploadDto: UpdateLabRadReportsUploadDto,
  ) {
    return `This action updates a #${id} labRadReportsUpload`;
  }

  remove(id: number) {
    return `This action removes a #${id} labRadReportsUpload`;
  }
}
