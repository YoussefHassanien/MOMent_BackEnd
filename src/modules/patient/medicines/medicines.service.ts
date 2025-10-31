import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Medicine } from '../../../database/entities/medicine.entity';
import { Patient } from '../../../database/entities/patient.entity';
import { PatientMedicine, MedicationSafetyLabel } from '../../../database/entities/patient-medicine.entity';
import { JwtPayload } from '../../auth/jwt.payload';
import { CreatePatientMedicineDto } from './dto/create-patient-medicine.dto';
import { UpdatePatientMedicineDto } from './dto/update-patient-medicine.dto';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,
    @InjectRepository(PatientMedicine)
    private readonly patientMedicineRepository: Repository<PatientMedicine>,
  ) {}

  async search(query: string, page = 1, limit = 30) {
    if (page <= 0 || limit <= 0) throw new BadRequestException('Page and limit must be positive');

    const [items, total] = await this.medicineRepository.findAndCount({
      where: { name: ILike(`%${query}%`) },
      skip: (page - 1) * limit,
      take: limit,
      select: ['globalId', 'name', 'category'],
      order: { name: 'ASC' },
    });

    return {
      items: items.map((m) => ({ id: m.globalId, name: m.name, category: m.category })),
      page,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
    };
  }

  private evaluateSafety(medicine: Medicine, patientAllergies: string[]) {
    const name = (medicine.name || '').toLowerCase();
    // allergy match
    for (const a of patientAllergies) {
      const an = (a || '').toLowerCase();
      if (!an) continue;
      if (name.includes(an) || an.includes(name) || (medicine.contraindications || '').toLowerCase().includes(an)) {
        return {
          canSave: false,
          label: MedicationSafetyLabel.DANGER,
          message: 'DANGER: contraindicated due to allergy',
        };
      }
    }

    const first = (medicine.pregnancyFirst || '').toLowerCase();
    const second = (medicine.pregnancySecond || '').toLowerCase();
    const third = (medicine.pregnancyThird || '').toLowerCase();
    const bf = (medicine.breastfeeding || '').toLowerCase();

    const contraKeywords = ['contraindicated', 'avoid', 'not allowed', 'not recommended', 'danger'];
    const containsContra = (s: string) => contraKeywords.some((k) => s.includes(k));

    const unsafeFirst = first && containsContra(first);
    const unsafeSecond = second && containsContra(second);
    const unsafeThird = third && containsContra(third);
    const unsafeBF = bf && containsContra(bf);

    // unsafe in all trimesters and breastfeeding -> block
    if (unsafeFirst && unsafeSecond && unsafeThird && unsafeBF) {
      return {
        canSave: false,
        label: MedicationSafetyLabel.DANGER,
        message: 'DANGER: Not safe for pregnancy/breastfeeding!',
      };
    }

    // unsafe only in specific trimesters
    if (unsafeFirst || unsafeSecond || unsafeThird) {
      const trimesters: string[] = [];
      if (unsafeFirst) trimesters.push('first');
      if (unsafeSecond) trimesters.push('second');
      if (unsafeThird) trimesters.push('third');
      return {
        canSave: true,
        label: MedicationSafetyLabel.CAUTION,
        message: `⚠️ May be unsafe in the (${trimesters.join(', ')}). Tap 'ⓘ Safety' for details.`,
      };
    }

    // not safe during breastfeeding
    if (unsafeBF) {
      return {
        canSave: true,
        label: MedicationSafetyLabel.CAUTION,
        message: `⚠️ Not recommended in breastfeeding. Tap 'ⓘ Safety' for details.`,
      };
    }

    // otherwise consider generally safe -> CAUTION (Yellow) per acceptance
    return {
      canSave: true,
      label: MedicationSafetyLabel.CAUTION,
      message: `Use carefully. Tap 'ⓘ Safety' for details.`,
    };
  }

  async createPatientMedicine(dto: CreatePatientMedicineDto, userData: JwtPayload) {
    const patient = await this.patientRepository.findOneBy({ userId: userData.id });
    if (!patient) throw new NotFoundException({ message: 'Patient not found!' });

    const medicine = await this.medicineRepository.findOneBy({ globalId: dto.medicineId });
    if (!medicine) throw new NotFoundException({ message: 'Medicine not found!' });

    // get patient allergies names
    const allergies = (await this.patientRepository.findOne({
      where: { id: patient.id },
      relations: ['allergies'],
    }))?.allergies?.map((a) => a.name) || [];

    const safety = this.evaluateSafety(medicine, allergies);
    if (!safety.canSave) {
      throw new BadRequestException({ message: safety.message });
    }

    const pm = this.patientMedicineRepository.create({
      patientId: patient.id,
      medicineId: medicine.id,
      dosage: dto.dosage,
      scheduleTimes: (dto.scheduleTimes || []).join(','),
      duration: dto.duration,
      safetyLabel: safety.label,
      contraindicatedByAllergy: false,
    });

    await this.patientMedicineRepository.save(pm);

    return {
      id: pm.globalId,
      name: medicine.name,
      dosage: pm.dosage,
      scheduleTimes: dto.scheduleTimes,
      duration: pm.duration,
      safetyLabel: pm.safetyLabel,
      safetyMessage: safety.message,
    };
  }

  async listPatientMedicines(userData: JwtPayload, page = 1, limit = 50) {
    const patient = await this.patientRepository.findOneBy({ userId: userData.id });
    if (!patient) throw new NotFoundException({ message: 'Patient not found!' });

    const [items, total] = await this.patientMedicineRepository.findAndCount({
      where: { patientId: patient.id },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items: items.map((it) => ({
        id: it.globalId,
        name: it.medicine?.name,
        dosage: it.dosage,
        scheduleTimes: it.scheduleTimes ? it.scheduleTimes.split(',') : [],
        duration: it.duration,
        safetyLabel: it.safetyLabel,
        safety: {
          contraindications: it.medicine?.contraindications,
          useWithCaution: it.medicine?.useWithCaution,
          contactYourDoctor: it.medicine?.contactYourPhysician,
        },
      })),
      page,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updatePatientMedicine(id: string, dto: UpdatePatientMedicineDto, userData: JwtPayload) {
    const patient = await this.patientRepository.findOneBy({ userId: userData.id });
    if (!patient) throw new NotFoundException({ message: 'Patient not found!' });

    const pm = await this.patientMedicineRepository.findOne({ where: { globalId: id, patientId: patient.id } });
    if (!pm) throw new NotFoundException({ message: 'Patient medicine not found!' });

    if (dto.dosage) pm.dosage = dto.dosage;
    if (dto.scheduleTimes) pm.scheduleTimes = dto.scheduleTimes.join(',');
    if (dto.duration) pm.duration = dto.duration;

    await this.patientMedicineRepository.save(pm);

    return { message: 'Successfully updated medicine' };
  }

  async removePatientMedicine(id: string, userData: JwtPayload) {
    const patient = await this.patientRepository.findOneBy({ userId: userData.id });
    if (!patient) throw new NotFoundException({ message: 'Patient not found!' });

    const pm = await this.patientMedicineRepository.findOneBy({ globalId: id, patientId: patient.id });
    if (!pm) throw new NotFoundException({ message: 'Patient medicine not found!' });

    await this.patientMedicineRepository.delete(pm.id);
    return { message: 'Successfully deleted medicine' };
  }
}
