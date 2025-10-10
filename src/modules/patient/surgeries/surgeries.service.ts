import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationResponse } from '../../../constants/interfaces';
import { Patient, Surgery } from '../../../database';
import { JwtPayload } from '../../../modules/auth/jwt.payload';
import { CreateSurgeryDto } from './dto/create-surgery.dto';

@Injectable()
export class SurgeriesService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Surgery)
    private readonly surgeryRepository: Repository<Surgery>,
  ) {}

  async create(createSurgeryDto: CreateSurgeryDto, userData: JwtPayload) {
    const patient = await this.patientRepository.findOneBy({
      userId: userData.id,
    });

    if (!patient) throw new NotFoundException({ message: 'Patient not found!' });

    await this.surgeryRepository.insert({
      name: createSurgeryDto.name,
      date: createSurgeryDto.date,
      patientId: patient.id,
    });

    return { message: 'Successfully added surgery' };
  }

  async findAll(
    userData: JwtPayload,
    page: number = 1,
    limit: number = 30,
  ) {
    if (page <= 0 || limit <= 0) {
      throw new BadRequestException({
        message: 'Page and limit must be positive integers',
      });
    }

    const patient = await this.patientRepository.findOneBy({
      userId: userData.id,
    });

    if (!patient) throw new NotFoundException({ message: 'Patient not found!' });

    const count = await this.surgeryRepository.countBy({ patientId: patient.id });

    const items = await this.surgeryRepository.find({
      where: { patientId: patient.id },
      select: { globalId: true, name: true, date: true, createdAt: true },
      skip: (page - 1) * limit,
      take: limit,
    });

    const response: PaginationResponse<Surgery> = {
      items,
      page,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
    };

    return { ...response };
  }

  async update(id: string, update: Partial<CreateSurgeryDto>, userData: JwtPayload) {
    const patient = await this.patientRepository.findOneBy({
      userId: userData.id,
    });

    if (!patient) throw new NotFoundException({ message: 'Patient not found!' });

    const record = await this.surgeryRepository.findOneBy({ globalId: id });

    if (!record) throw new NotFoundException({ message: 'Surgery not found!' });

    if (record.patientId !== patient.id) throw new UnauthorizedException();

    await this.surgeryRepository.update(record.id, update);

    return { message: 'Successfully updated surgery' };
  }

  async remove(id: string, userData: JwtPayload) {
    const patient = await this.patientRepository.findOneBy({
      userId: userData.id,
    });

    if (!patient) throw new NotFoundException({ message: 'Patient not found!' });

    const record = await this.surgeryRepository.findOneBy({ globalId: id });

    if (!record) throw new NotFoundException({ message: 'Surgery not found!' });

    if (record.patientId !== patient.id) throw new UnauthorizedException();

    await this.surgeryRepository.delete(record.id);

    return { message: 'Successfully deleted surgery' };
  }
}

