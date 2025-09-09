import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VitalSignType } from '../../../database';
import { CreateVitalSignTypeDto } from './dto/create-vital-sign-type.dto';
import { UpdateVitalSignTypeDto } from './dto/update-vital-sign-type.dto';

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
      minValidValue: createdVitalSignType.minValidValue,
      maxValidValue: createdVitalSignType.maxValidValue,
      lowValueAlert: createdVitalSignType.lowValueAlert,
      highValueAlert: createdVitalSignType.highValueAlert,
      createdAt: createdVitalSignType.createdAt,
      updatedAt: createdVitalSignType.updatedAt,
    };
  }

  findAll() {
    return `This action returns all vitalSignType`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vitalSignType`;
  }

  update(id: number, updateVitalSignTypeDto: UpdateVitalSignTypeDto) {
    return `This action updates a #${id} vitalSignType`;
  }

  remove(id: number) {
    return `This action removes a #${id} vitalSignType`;
  }
}
