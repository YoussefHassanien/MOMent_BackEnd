import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AllergiesTypes } from '../../../constants/enums';
import { PaginationResponse } from '../../../constants/interfaces';
import { Allergy, Patient } from '../../../database';
import { JwtPayload } from '../../auth/jwt.payload';
import { CreateFoodDrugAllergyDto } from './dto/create-food-drug-allergy.dto';

@Injectable()
export class FoodDrugAllergiesService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Allergy)
    private readonly allergyRepository: Repository<Allergy>,
  ) {}

  async create(
    createFoodDrugAllergyDto: CreateFoodDrugAllergyDto,
    userData: JwtPayload,
  ) {
    const patient = await this.patientRepository.findOneBy({
      userId: userData.id,
    });

    if (!patient)
      throw new NotFoundException({ message: 'Patient not found!' });

    const allergy = this.allergyRepository.create({
      name: createFoodDrugAllergyDto.name,
      type: createFoodDrugAllergyDto.type,
      patientId: patient.id,
    });

    await this.allergyRepository.save(allergy);

    return { id: allergy.globalId, name: allergy.name, type: allergy.type };
  }

  async findAll(
    userData: JwtPayload,
    type: AllergiesTypes,
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

    if (!patient)
      throw new NotFoundException({ message: 'Patient not found!' });

    const totalItems = await this.allergyRepository.countBy({
      patientId: patient.id,
      type,
    });

    const allergies = await this.allergyRepository.find({
      where: {
        patientId: patient.id,
        type,
      },
      select: {
        globalId: true,
        name: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const response: PaginationResponse<{ id: string; name: string }> = {
      items: allergies.map(({ globalId, name }) => ({ id: globalId, name })),
      page,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };

    return {
      ...response,
    };
  }

  async remove(userData: JwtPayload, id: string) {
    const patient = await this.patientRepository.findOneBy({
      userId: userData.id,
    });

    if (!patient)
      throw new NotFoundException({ message: 'Patient not found!' });

    const allergy = await this.allergyRepository.findOneBy({
      globalId: id,
      patientId: patient.id,
    });

    if (!allergy)
      throw new NotFoundException({ message: 'Allergy not found!' });

    await this.allergyRepository.delete(allergy.id);

    return { message: 'Successfully deleted allergy' };
  }
}
