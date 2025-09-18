import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalReport, Patient } from '../../../database';
import { JwtPayload } from '../../../modules/auth/jwt.payload';
import { CloudinaryService } from '../../../services/cloudinary.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class MedicalReportsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(MedicalReport)
    private readonly medicalReportRepository: Repository<MedicalReport>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async create(
    file: Express.Multer.File,
    createReportDto: CreateReportDto,
    userData: JwtPayload,
  ) {
    const patient = await this.patientRepository.findOneBy({
      userId: userData.id,
    });

    if (!patient)
      throw new NotFoundException({ message: 'Patient not found!' });

    const url = await this.cloudinaryService.uploadPatientMedicalReport(
      file,
      patient.globalId,
    );

    if (!url)
      throw new InternalServerErrorException({
        message: 'Error during uploading the medical report',
      });

    await this.medicalReportRepository.insert({
      name: createReportDto.name,
      type: createReportDto.type,
      date: createReportDto.date,
      url: url,
      patientId: patient.id,
    });

    return {
      url,
    };
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
