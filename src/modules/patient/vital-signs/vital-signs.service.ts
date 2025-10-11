import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from 'src/modules/auth/jwt.payload';
import { Repository, MoreThan } from 'typeorm';
import { Repository } from 'typeorm';
import { VitalSignsTypes } from '../../../constants/enums';
import { Patient, VitalSign, VitalSignType } from '../../../database';
import { JwtPayload } from '../../../modules/auth/jwt.payload';
import { CreateAgeDto } from './dto/create-age.dto';
import { CreateVitalSignDto } from './dto/create-vital-sign.dto';
import { GetVitalSignHistoryDto } from './dto/get-vital-sign-history.dto';
import { UpdateVitalSignDto } from './dto/update-vital-sign.dto';

@Injectable()
export class VitalSignsService {
  private readonly egyptTime: number;
  constructor(
    @InjectRepository(VitalSign)
    private readonly vitalSignRepository: Repository<VitalSign>,
    @InjectRepository(VitalSignType)
    private readonly vitalSignTypeRepository: Repository<VitalSignType>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly configService: ConfigService,
  ) {
    this.egyptTime = this.configService.getOrThrow<number>('egyptTime');
  }
  async create(createVitalSignDto: CreateVitalSignDto, userData: JwtPayload) {
    const [patient, vitalSignType] = await Promise.all([
      this.patientRepository.findOneBy({
        userId: userData.id,
      }),
      this.vitalSignTypeRepository.findOneBy({
        globalId: createVitalSignDto.typeId,
      }),
    ]);

    if (!patient)
      throw new NotFoundException({ message: 'Patient not found!' });

    if (!vitalSignType)
      throw new NotFoundException({ message: 'Vital sign type not found!' });

    if (
      vitalSignType.type === VitalSignsTypes.AGE ||
      vitalSignType.type === VitalSignsTypes.BODY_MASS_INDEX
    )
      throw new BadRequestException({
        message: 'This endpoint is not for age and body mass index',
      });

    this.validateVitalSignValue(vitalSignType, createVitalSignDto.value);

    const warning = this.checkWarning(vitalSignType, createVitalSignDto.value);

    const vitalSign = this.vitalSignRepository.create({
      patientId: patient.id,
      typeId: vitalSignType.id,
      value: createVitalSignDto.value,
    });

    await this.vitalSignRepository.save(vitalSign);

    if (
      vitalSignType.type === VitalSignsTypes.HEIGHT ||
      vitalSignType.type === VitalSignsTypes.WEIGHT
    ) {
      await this.calculateAndSaveBMI(patient.id);
    }

    return {
      id: vitalSign.globalId,
      value: vitalSign.value,
      type: vitalSignType.type,
      unit: vitalSignType.unit,
      createdAt: new Date(
        new Date(vitalSign.createdAt).getTime() + this.egyptTime,
      ),
      updatedAt: new Date(
        new Date(vitalSign.updatedAt).getTime() + this.egyptTime,
      ),
      warning: warning,
    };
  }

  async createAge(createAgeDto: CreateAgeDto, userData: JwtPayload) {
    const [patient, vitalSignType] = await Promise.all([
      this.patientRepository.findOneBy({
        userId: userData.id,
      }),
      this.vitalSignTypeRepository.findOneBy({
        globalId: createAgeDto.typeId,
      }),
    ]);

    if (!patient)
      throw new NotFoundException({ message: 'Patient not found!' });

    if (!vitalSignType || vitalSignType.type !== VitalSignsTypes.AGE)
      throw new BadRequestException({ message: 'Type id is not the AGE id' });

    const existingAge = await this.vitalSignRepository.findOneBy({
      patientId: patient.id,
      typeId: vitalSignType.id,
    });

    if (existingAge)
      throw new BadRequestException({ message: 'Age already exists' });

    await this.patientRepository.update(patient.id, {
      dateOfBirth: createAgeDto.dateOfBirth,
    });

    const age = this.calculateAge(createAgeDto.dateOfBirth);

    const vitalSign = this.vitalSignRepository.create({
      patientId: patient.id,
      typeId: vitalSignType.id,
      value: age,
    });

    await this.vitalSignRepository.save(vitalSign);

    return {
      id: vitalSign.globalId,
      type: vitalSignType.type,
      value: age,
      unit: vitalSignType.unit,
      createdAt: new Date(
        new Date(vitalSign.createdAt).getTime() + this.egyptTime,
      ),
      updatedAt: new Date(
        new Date(vitalSign.updatedAt).getTime() + this.egyptTime,
      ),
    };
  }

  async findAll(userData: JwtPayload) {
    const patient = await this.patientRepository.findOneBy({
      userId: userData.id,
    });

    if (!patient)
      throw new NotFoundException({ message: 'Patient not found!' });

    const vitalSignTypes = await this.vitalSignTypeRepository.find();

    const vitalSignsResponse: Record<string, any> = {};

    for (const vitalSignType of vitalSignTypes) {
      const baseResponse: {
        typeId: string;
        unit: string;
        minValidValue: number;
        maxValidValue: number;
        lowValueAlert: number;
        highValueAlert: number;
        id: string | null;
        value: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        warning: string | null;
      } = {
        typeId: vitalSignType.globalId,
        unit: vitalSignType.unit,
        minValidValue: vitalSignType.minValidValue,
        maxValidValue: vitalSignType.maxValidValue,
        lowValueAlert: vitalSignType.lowValueAlert,
        highValueAlert: vitalSignType.highValueAlert,
        id: null,
        value: null,
        createdAt: null,
        updatedAt: null,
        warning: null,
      };

      const mostRecentVitalSign = await this.vitalSignRepository.findOne({
        where: {
          patientId: patient.id,
          typeId: vitalSignType.id,
        },
        order: {
          createdAt: 'DESC',
        },
      });

      if (mostRecentVitalSign) {
        const warning = this.checkWarning(
          vitalSignType,
          mostRecentVitalSign.value,
        );

        baseResponse.id = mostRecentVitalSign.globalId;
        baseResponse.value = mostRecentVitalSign.value;
        baseResponse.createdAt = new Date(
          new Date(mostRecentVitalSign.createdAt).getTime() + this.egyptTime,
        );
        baseResponse.updatedAt = new Date(
          new Date(mostRecentVitalSign.updatedAt).getTime() + this.egyptTime,
        );
        baseResponse.warning = warning;
      }

      vitalSignsResponse[vitalSignType.type] = baseResponse;
    }

    return vitalSignsResponse;
  }

  async getVitalSignHistory(
    getVitalSignHistoryDto: GetVitalSignHistoryDto,
    userData: JwtPayload,
  ) {
    const patient = await this.patientRepository.findOneBy({
      userId: userData.id,
    });

    if (!patient)
      throw new NotFoundException({ message: 'Patient not found!' });

    const vitalSignType = await this.vitalSignTypeRepository.findOneBy({
      globalId: getVitalSignHistoryDto.typeId,
    });

    if (!vitalSignType)
      throw new NotFoundException({ message: 'Vital sign type not found!' });

    const days = getVitalSignHistoryDto.days || 14;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const vitalSigns = await this.vitalSignRepository.find({
      where: {
        patientId: patient.id,
        typeId: vitalSignType.id,
        createdAt: MoreThan(fromDate),
      },
      order: {
        createdAt: 'ASC',
      },
    });

    const readings = vitalSigns.map((vitalSign) => {
      const warning = this.checkWarning(vitalSignType, vitalSign.value);

      return {
        id: vitalSign.globalId,
        value: vitalSign.value,
        createdAt: new Date(
          new Date(vitalSign.createdAt).getTime() + this.egyptTime,
        ),
      };
    });

    return {
      type: vitalSignType.type,
      unit: vitalSignType.unit,
      minValidValue: vitalSignType.minValidValue,
      maxValidValue: vitalSignType.maxValidValue,
      lowValueAlert: vitalSignType.lowValueAlert,
      highValueAlert: vitalSignType.highValueAlert,
      period: `${days} days`,
      totalReadings: readings.length,
      readings: readings,
    };
  }

  async getAllVitalSignTypes() {
    const vitalSignTypes = await this.vitalSignTypeRepository.find({
      order: {
        type: 'ASC',
      },
    });

    return vitalSignTypes.map((vitalSignType) => ({
      typeId: vitalSignType.globalId,
      type: vitalSignType.type,
      unit: vitalSignType.unit,
    }));
  }

  findOne(id: string) {
    return `This action returns a vital sign with UUID: ${id}`;
  }

  async update(updateVitalSignDto: UpdateVitalSignDto, userData: JwtPayload) {
    const vitalSign = await this.vitalSignRepository.findOne({
      where: {
        globalId: updateVitalSignDto.id,
        patient: { userId: userData.id },
      },
      relations: { vitalSignType: true, patient: true },
    });

    if (!vitalSign)
      throw new NotFoundException({
        message: 'Vital sign not found!',
      });

    if (!vitalSign.vitalSignType)
      throw new NotFoundException({
        message: 'Vital sign type not found!',
      });

    if (!vitalSign.patient)
      throw new NotFoundException({
        message: 'Patient not found!',
      });

    const vitalSignType = vitalSign.vitalSignType;

    if (
      vitalSignType.type === VitalSignsTypes.AGE ||
      vitalSignType.type === VitalSignsTypes.BODY_MASS_INDEX
    )
      throw new BadRequestException({
        message: 'This endpoint is not for age and body mass index',
      });

    this.validateVitalSignValue(vitalSignType, updateVitalSignDto.value);

    const warning = this.checkWarning(vitalSignType, updateVitalSignDto.value);

    vitalSign.value = updateVitalSignDto.value;
    const updatedVitalSign = await this.vitalSignRepository.save(vitalSign);

    if (
      vitalSignType.type === VitalSignsTypes.HEIGHT ||
      vitalSignType.type === VitalSignsTypes.WEIGHT
    ) {
      await this.calculateAndSaveBMI(vitalSign.patient.id, true);
    }

    return {
      id: updatedVitalSign.globalId,
      value: updatedVitalSign.value,
      type: vitalSignType.type,
      createdAt: new Date(
        new Date(updatedVitalSign.createdAt).getTime() + this.egyptTime,
      ),
      updatedAt: new Date(
        new Date(updatedVitalSign.updatedAt).getTime() + this.egyptTime,
      ),
      warning: warning,
    };
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

  private calculateAge(dateOfBirth: Date) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // If birth month hasn't occurred this year, or
    // if birth month is current month but birth day hasn't occurred
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  private async calculateAndSaveBMI(
    patientId: number,
    isUpdate: boolean = false,
  ) {
    const [bmiType, heightType, weightType] = await Promise.all([
      this.vitalSignTypeRepository.findOneBy({
        type: VitalSignsTypes.BODY_MASS_INDEX,
      }),
      this.vitalSignTypeRepository.findOneBy({
        type: VitalSignsTypes.HEIGHT,
      }),
      this.vitalSignTypeRepository.findOneBy({
        type: VitalSignsTypes.WEIGHT,
      }),
    ]);

    if (!bmiType || !heightType || !weightType) {
      return;
    }

    const [heightVitalSign, weightVitalSign] = await Promise.all([
      this.vitalSignRepository.findOne({
        where: { patientId: patientId, typeId: heightType.id },
        order: { createdAt: 'DESC' },
      }),
      this.vitalSignRepository.findOne({
        where: { patientId: patientId, typeId: weightType.id },
        order: { createdAt: 'DESC' },
      }),
    ]);

    if (heightVitalSign && weightVitalSign) {
      const heightInMeters = heightVitalSign.value / 100; // Convert cm to meters
      const weightInKg = weightVitalSign.value; // Weight in kg
      const bmi = Number((weightInKg / heightInMeters ** 2).toFixed(1));

      if (!isUpdate) {
        const bmiVitalSign = this.vitalSignRepository.create({
          patientId: patientId,
          typeId: bmiType.id,
          value: bmi,
        });

        await this.vitalSignRepository.save(bmiVitalSign);
      } else {
        await this.vitalSignRepository.update(
          {
            patientId: patientId,
            typeId: bmiType.id,
          },
          { value: bmi },
        );
      }
    }
  }
}
