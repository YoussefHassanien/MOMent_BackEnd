import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { DashboardVitalSignsPeriod } from '../../../constants/enums';
import { Patient, VitalSign, VitalSignType } from '../../../database';
import { JwtPayload } from '../../auth/jwt.payload';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(VitalSign)
    private readonly vitalSignRepository: Repository<VitalSign>,
    @InjectRepository(VitalSignType)
    private readonly vitalSignTypeRepository: Repository<VitalSignType>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async findAllVitalSignsTypes(userData: JwtPayload) {
    const patient = await this.patientRepository.findOneBy({
      userId: userData.id,
    });

    if (!patient)
      throw new NotFoundException({ message: 'Patient not found!' });

    const vitalSignTypes = await this.vitalSignTypeRepository.find({
      select: {
        type: true,
        globalId: true,
        unit: true,
      },
    });

    return vitalSignTypes.map((v) => ({
      id: v.globalId,
      type: v.type,
      unit: v.unit,
    }));
  }

  async findOneVitalSign(
    userData: JwtPayload,
    id: string,
    period: DashboardVitalSignsPeriod,
  ) {
    const patient = await this.patientRepository.findOneBy({
      userId: userData.id,
    });

    if (!patient)
      throw new NotFoundException({ message: 'Patient not found!' });

    const vitalSignType = await this.vitalSignTypeRepository.findOne({
      select: {
        id: true,
      },
      where: { globalId: id },
    });

    if (!vitalSignType)
      throw new NotFoundException({ message: 'Vital sign type not found!' });

    const startDate = this.convertPeriodIntoDate(period);

    const vitalSigns = await this.vitalSignRepository.find({
      select: {
        globalId: true,
        value: true,
        createdAt: true,
      },
      where: {
        createdAt: MoreThan(startDate),
        typeId: vitalSignType.id,
        patientId: patient.id,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    const average = this.calculateVitalSignAverage(vitalSigns);

    return {
      readings: vitalSigns.map((v) => ({
        id: v.globalId,
        value: v.value,
        createdAt: v.createdAt,
      })),
      average,
    };
  }

  private convertPeriodIntoDate = (period: DashboardVitalSignsPeriod) => {
    const weeksNumber = parseInt(period.split(' ')[1]);
    const now = new Date();
    const startDate = new Date(
      now.getTime() - weeksNumber * 24 * 60 * 60 * 1000,
    );
    startDate.setHours(0, 0, 0, 0);
    return new Date(Date.now() - startDate.getTime());
  };

  private calculateVitalSignAverage = (vitalSignReadings: VitalSign[]) => {
    let average = 0;
    let sum = 0;

    if (vitalSignReadings.length) {
      vitalSignReadings.forEach((v) => {
        sum += v.value;
      });
      average = parseFloat((sum / vitalSignReadings.length).toFixed(2));
    }

    return average;
  };
}
