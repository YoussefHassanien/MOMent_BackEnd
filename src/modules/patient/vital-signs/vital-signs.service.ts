import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVitalSignDto } from './dto/create-vital-sign.dto';
import { UpdateVitalSignDto } from './dto/update-vital-sign.dto';
import JwtPayload from 'src/modules/auth/jwt.payload';
import { InjectRepository } from '@nestjs/typeorm';
import { VitalSign, VitalSignType, Patient } from '../../../database/index';
import { Repository } from 'typeorm';

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

    if (
      createVitalSignDto.value > vitalSignType.maxValidValue ||
      createVitalSignDto.value < vitalSignType.minValidValue
    )
      throw new BadRequestException({ message: `Invalid vital sign value` });

    let warning: string | null = null;

    if (createVitalSignDto.value >= vitalSignType.highValueAlert)
      warning = `High ${vitalSignType.type} value, Please contact your doctor`;

    if (createVitalSignDto.value <= vitalSignType.lowValueAlert)
      warning = `Low ${vitalSignType.type} value, Please contact your doctor`;

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

  findAll() {
    return `This action returns all vitalSigns`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vitalSign`;
  }

  update(id: number, updateVitalSignDto: UpdateVitalSignDto) {
    return `This action updates a #${id} vitalSign`;
  }

  remove(id: number) {
    return `This action removes a #${id} vitalSign`;
  }
}
