import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VitalSignType } from '../../../database';
import { CreateVitalSignTypeDto } from './dto/create-vital-sign-type.dto';

@Injectable()
export class VitalSignTypeService {
  constructor(
    @InjectRepository(VitalSignType)
    private readonly vitalSignTypeRepository: Repository<VitalSignType>,
  ) {}
  async create(createVitalSignTypeDto: CreateVitalSignTypeDto) {
    const createdVitalSignType = this.vitalSignTypeRepository.create(
      createVitalSignTypeDto,
    );

    await this.vitalSignTypeRepository.save(createdVitalSignType);
    return {
      id: createdVitalSignType.globalId,
      type: createdVitalSignType.type,
      unit: createdVitalSignType.unit,
      minValidValue: createdVitalSignType.minValidValue,
      maxValidValue: createdVitalSignType.maxValidValue,
      lowValueAlert: createdVitalSignType.lowValueAlert,
      highValueAlert: createdVitalSignType.highValueAlert,
      createdAt: createdVitalSignType.createdAt,
      updatedAt: createdVitalSignType.updatedAt,
    };
  }
}
