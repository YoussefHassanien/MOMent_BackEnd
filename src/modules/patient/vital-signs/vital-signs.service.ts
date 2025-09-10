import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from 'src/modules/auth/jwt.payload';
import { Repository } from 'typeorm';
import { Patient, VitalSign, VitalSignType } from '../../../database';
import { CreateVitalSignDto } from './dto/create-vital-sign.dto';
import { UpdateVitalSignDto } from './dto/update-vital-sign.dto';

@Injectable()
export class VitalSignsService {
  constructor(
    @InjectRepository(VitalSign)
    private readonly vitalSignRepository: Repository<VitalSign>,
    @InjectRepository(VitalSignType)
    private readonly vitalSignTypeRepository: Repository<VitalSignType>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}
  async create(createVitalSignDto: CreateVitalSignDto, userData: JwtPayload) {
    const patient = await this.patientRepository.findOneBy({
      userId: userData.id,
    });

    if (!patient)
      throw new NotFoundException({ message: 'Patient not found!' });

    const vitalSignType = await this.vitalSignTypeRepository.findOneBy({
      globalId: createVitalSignDto.typeId,
    });

    if (!vitalSignType)
      throw new NotFoundException({ message: 'Vital sign type not found!' });

    this.validateVitalSignValue(vitalSignType, createVitalSignDto.value);

    const warning = this.checkWarning(vitalSignType, createVitalSignDto.value);

    const vitalSign = this.vitalSignRepository.create({
      patientId: patient.id,
      typeId: vitalSignType.id,
      value: createVitalSignDto.value,
    });

    await this.vitalSignRepository.save(vitalSign);

    return {
      id: vitalSign.globalId,
      value: vitalSign.value,
      type: vitalSignType.type,
      createdAt: vitalSign.createdAt,
      updatedAt: vitalSign.updatedAt,
      warnig: warning,
    };
  }

  async findAll(userData: JwtPayload) {
    const patient = await this.patientRepository.findOneBy({
      userId: userData.id,
    });

    if (!patient)
      throw new NotFoundException({ message: 'Patient not found!' });
  }

  findOne(id: string) {
    return `This action returns a vital sign with UUID: ${id}`;
  }

  async update(id: string, updateVitalSignDto: UpdateVitalSignDto) {
    const vitalSign = await this.vitalSignRepository.findOneBy({
      globalId: id,
    });

    if (!vitalSign)
      throw new NotFoundException({ message: 'Vital sign not found!' });

    const vitalSignType = await this.vitalSignTypeRepository.findOneBy({
      id: vitalSign.typeId,
    });

    if (!vitalSignType)
      throw new NotFoundException({ message: 'Vital sign type not found!' });

    this.validateVitalSignValue(vitalSignType, updateVitalSignDto.value);

    const warning = this.checkWarning(vitalSignType, updateVitalSignDto.value);

    // Update the vital sign value
    vitalSign.value = updateVitalSignDto.value;

    // Save the updated vital sign
    await this.vitalSignRepository.save(vitalSign);

    return {
      id: vitalSign.globalId,
      value: vitalSign.value,
      type: vitalSignType.type,
      createdAt: vitalSign.createdAt,
      updatedAt: vitalSign.updatedAt,
      warning: warning,
    };
  }

  remove(id: string) {
    return `This action removes a vital sign with UUID: ${id}`;
  }

  private validateVitalSignValue(vitalSignType: VitalSignType, value: number) {
    if (
      value > vitalSignType.maxValidValue ||
      value < vitalSignType.minValidValue
    )
      throw new BadRequestException({ message: `Invalid vital sign value` });
  }

  private checkWarning(vitalSigntype: VitalSignType, value: number) {
    let warning: string | null = null;

    if (value >= vitalSigntype.highValueAlert)
      warning = `High ${vitalSigntype.type} value, Please contact your doctor`;

    if (value <= vitalSigntype.lowValueAlert)
      warning = `Low ${vitalSigntype.type} value, Please contact your doctor`;

    return warning;
  }
}
