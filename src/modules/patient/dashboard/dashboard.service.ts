import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Not, Repository } from 'typeorm';
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
      where: {
        type: Not(
          In([
            VitalSignsTypes.DIASTOLIC_PRESSURE,
            VitalSignsTypes.AGE,
            VitalSignsTypes.BODY_MASS_INDEX,
          ]),
        ),
      },
    });

    return vitalSignTypes.map((v) => ({
      id: v.globalId,
      type:
        v.type === VitalSignsTypes.SYSTOLIC_PRESSURE
          ? 'Pressure'
          : v.type[0].toUpperCase() +
            v.type.slice(1).replace(/_/g, ' ').toLowerCase(),
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
    let vitalSigns: { value: string | number; createdAt: Date }[] = [];
    if (
      vitalSignType.type === VitalSignsTypes.SYSTOLIC_PRESSURE ||
      vitalSignType.type === VitalSignsTypes.DIASTOLIC_PRESSURE
    ) {
      // fetch both in parallel (keeps DB latency minimal)
      const [systolicPressureReadings, diastolicPressureReadings] =
        await Promise.all([
          this.vitalSignRepository.find({
            select: { value: true, createdAt: true },
            where: {
              createdAt: MoreThan(startDate),
              vitalSignType: { type: VitalSignsTypes.SYSTOLIC_PRESSURE },
              patientId: patient.id,
            },
            order: { createdAt: 'ASC' },
          }),
          this.vitalSignRepository.find({
            select: { value: true, createdAt: true },
            where: {
              createdAt: MoreThan(startDate),
              vitalSignType: { type: VitalSignsTypes.DIASTOLIC_PRESSURE },
              patientId: patient.id,
            },
            order: { createdAt: 'ASC' },
          }),
        ]);

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

      vitalSigns = rawvitalSigns;
    }

    return {
      readings: vitalSigns,
    };
  }

  private convertPeriodIntoDate = (period: DashboardVitalSignsPeriod) => {
    const weeksNumber = parseInt(period.split(' ')[1]);
    const startDate = new Date(
      Date.now() - weeksNumber * 7 * 24 * 60 * 60 * 1000,
      Date.now() - weeksNumber * 7 * 24 * 60 * 60 * 1000,
    );
    startDate.setHours(0, 0, 0, 0);
    return startDate;
    return startDate;
  };

  private matchPressureReadings(
    systolicReadings: VitalSign[],
    diastolicReadings: VitalSign[],
  ) {
    const matched: { value: string; createdAt: Date }[] = [];
    const TEN_MINUTES_MS = 10 * 60 * 1000;

    let i = 0;
    let j = 0;
    while (i < systolicReadings.length && j < diastolicReadings.length) {
      const s = systolicReadings[i];
      const d = diastolicReadings[j];
      const sT = new Date(s.createdAt).getTime();
      const dT = new Date(d.createdAt).getTime();
      const diff = sT - dT;

      if (Math.abs(diff) <= TEN_MINUTES_MS) {
        matched.push({
          value: `${s.value}/${d.value}`,
          createdAt: s.createdAt,
        });
        i++;
        j++;
      } else if (diff < 0) {
        // systolic earlier — advance systolic pointer
        i++;
      } else {
        // diastolic earlier — advance diastolic pointer
        j++;
      }
    }
    return matched;
  }
}
