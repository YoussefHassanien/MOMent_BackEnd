import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationResponse } from '../../../constants/interfaces';
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

  async findAll(userData: JwtPayload, page: number = 1, limit: number = 30) {
    if (page <= 0 || limit <= 0) {
      throw new BadRequestException({
        message: 'Page and limit must be positive integers',
      });
    }

    const patient = await this.patientRepository.findOneBy({
      userId: userData.id,
    });

    if (!patient)
      throw new NotFoundException({ message: 'Patient not found!' });

    const medicalReportsCount = await this.medicalReportRepository.countBy({
      patientId: patient.id,
    });

    const medicalReports = await this.medicalReportRepository.find({
      where: {
        patientId: patient.id,
      },
      select: {
        globalId: true,
        name: true,
        date: true,
        type: true,
        url: true,
        createdAt: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const response: PaginationResponse<MedicalReport> = {
      items: medicalReports,
      page,
      totalItems: medicalReportsCount,
      totalPages: Math.ceil(medicalReportsCount / limit),
    };

    return {
      ...response,
    };
  }

  async remove(id: string, userData: JwtPayload) {
    const patient = await this.patientRepository.findOneBy({
      userId: userData.id,
    });

    if (!patient)
      throw new NotFoundException({ message: 'Patient not found!' });

    const medicalRecord = await this.medicalReportRepository.findOneBy({
      globalId: id,
    });

    if (!medicalRecord)
      throw new NotFoundException({ message: 'Medical record not found!' });

    if (medicalRecord.patientId !== patient.id)
      throw new UnauthorizedException();

    const isDeleted = await this.cloudinaryService.deletePatientMedicalReport(
      medicalRecord.url,
    );

    if (!isDeleted)
      throw new InternalServerErrorException({
        message: 'Error deleteing patient medical record',
      });

    await this.medicalReportRepository.delete(medicalRecord.id);

    return {
      message: 'Successfully deleted patient medical record',
    };
  }
}
