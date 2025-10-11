import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import {
  DashboardVitalSignsPeriod,
  VitalSignsTypes,
} from '../../../constants/enums';
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

    return vitalSignTypes
      .filter((v) => v.type !== VitalSignsTypes.DIASTOLIC_PRESSURE)
      .map((v) => ({
        id: v.globalId,
        type:
          v.type === VitalSignsTypes.SYSTOLIC_PRESSURE ? 'PRESSURE' : v.type,
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
        type: true,
      },
      where: { globalId: id },
    });

    if (!vitalSignType)
      throw new NotFoundException({ message: 'Vital sign type not found!' });

    const startDate = this.convertPeriodIntoDate(period);
    let vitalSigns: { value: string; createdAt: Date }[] = [];
    if (
      vitalSignType.type === VitalSignsTypes.SYSTOLIC_PRESSURE ||
      vitalSignType.type === VitalSignsTypes.DIASTOLIC_PRESSURE
    ) {
      const systolicPressureReadings = await this.vitalSignRepository.find({
        select: {
          value: true,
          createdAt: true,
        },
        where: {
          createdAt: MoreThan(startDate),
          vitalSignType: {
            type: VitalSignsTypes.SYSTOLIC_PRESSURE,
          },
          patientId: patient.id,
        },
        order: {
          createdAt: 'ASC',
        },
      });
      const diastolicPressureReadings = await this.vitalSignRepository.find({
        select: {
          value: true,
          createdAt: true,
        },
        where: {
          createdAt: MoreThan(startDate),
          vitalSignType: {
            type: VitalSignsTypes.DIASTOLIC_PRESSURE,
          },
          patientId: patient.id,
        },
        order: {
          createdAt: 'ASC',
        },
      });

      vitalSigns = this.matchPressureReadings(
        systolicPressureReadings,
        diastolicPressureReadings,
      );
    } else {
      const rawvitalSigns = await this.vitalSignRepository.find({
        select: {
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

      vitalSigns = rawvitalSigns.map((v) => ({
        value: v.value.toString(),
        createdAt: v.createdAt,
      }));
    }

    return {
      readings: vitalSigns.map((v) => ({
        value: v.value,
        createdAt: v.createdAt,
      })),
    };
  }

  private convertPeriodIntoDate = (period: DashboardVitalSignsPeriod) => {
    const weeksNumber = parseInt(period.split(' ')[1]);
    const startDate = new Date(
      Date.now() - weeksNumber * 7 * 24 * 60 * 60 * 1000,
    );
    startDate.setHours(0, 0, 0, 0);
    return startDate;
  };

  private matchPressureReadings(
    systolicReadings: VitalSign[],
    diastolicReadings: VitalSign[],
  ) {
    const matched: { value: string; createdAt: Date }[] = [];
    const TEN_MINUTES_MS = 10 * 60 * 1000;

    for (const systolic of systolicReadings) {
      // Find diastolic reading within 10 minutes
      const diastolic = diastolicReadings.find((d) => {
        const timeDiff = Math.abs(
          new Date(d.createdAt).getTime() -
            new Date(systolic.createdAt).getTime(),
        );
        return timeDiff <= TEN_MINUTES_MS;
      });

      if (diastolic) {
        matched.push({
          value: `${systolic.value}/${diastolic.value}`,
          createdAt: systolic.createdAt,
        });
        // Remove matched diastolic to avoid duplicate matching
        const index = diastolicReadings.indexOf(diastolic);
        diastolicReadings.splice(index, 1);
      }
    }
    return matched;
  }
}
