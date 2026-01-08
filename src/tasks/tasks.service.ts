import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Or,
  Repository,
} from 'typeorm';
import { OTP, PatientMedicine } from '../database';
import { EmailService } from '../services/email.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(OTP)
    private readonly otpRepository: Repository<OTP>,
    @InjectRepository(PatientMedicine)
    private readonly patientMedicineRepository: Repository<PatientMedicine>,
    private readonly emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM, {
    name: 'deleteExpiredOtps',
    timeZone: 'Africa/Cairo',
  })
  private async deleteExpiredOtps() {
    try {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      const result = await this.otpRepository.delete({
        createdAt: LessThan(fiveDaysAgo),
      });
      this.logger.log(
        `Cleanup completed. Deleted ${result.affected} expired otps`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to delete expired otps',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Medication reminder cron job - runs every 10 minutes
   * Checks if any medications are due and sends email reminders
   */
  @Cron(CronExpression.EVERY_10_MINUTES, {
    name: 'sendMedicationReminders',
    timeZone: 'Africa/Cairo',
  })
  private async sendMedicationReminders() {
    this.logger.log('Starting medication reminder check...');

    const now = new Date();
    const cairoTimeNow = new Date(
      now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' }),
    );

    const patientsMedications = await this.patientMedicineRepository.find({
      relations: {
        patient: {
          user: true,
        },
        medicine: true,
      },
      where: {
        startDate: Or(LessThanOrEqual(now), IsNull()),
        endDate: Or(MoreThanOrEqual(now), IsNull()),
      },
    });

    const patientsMedicationsMap = new Map<number, PatientMedicine[]>();
    for (const med of patientsMedications) {
      if (!patientsMedicationsMap.has(med.patientId)) {
        patientsMedicationsMap.set(med.patientId, []);
      }
      patientsMedicationsMap.get(med.patientId)!.push(med);
    }

    for (const [patientId, medications] of patientsMedicationsMap.entries()) {
      const allDueMedications: {
        name: string;
        dosage: string;
        time: string;
        medicineId: number;
      }[] = [];

      for (const med of medications) {
        const scheduleTimes = med.scheduleTimes.split(',');
        for (const timeStr of scheduleTimes) {
          // Check if reminder was sent recently
          if (
            now.getTime() - 10 * 60 * 1000 <=
              new Date(med.lastSentAt).getTime() &&
            new Date(med.lastSentAt) < now
          )
            continue;

          const [hours, minutes] = timeStr.split(':').map(Number);
          const scheduledDate = new Date();
          scheduledDate.setHours(hours, minutes, 0, 0);
          const scheduledDateCairoTime = new Date(
            scheduledDate.toLocaleString('en-US', { timeZone: 'Africa/Cairo' }),
          );

          if (
            cairoTimeNow.getTime() - 10 * 60 * 1000 <=
              scheduledDateCairoTime.getTime() &&
            scheduledDateCairoTime < cairoTimeNow
          ) {
            allDueMedications.push({
              name: med.medicine.name,
              dosage: med.dosage,
              time: timeStr,
              medicineId: med.medicine.id,
            });
          }
        }
      }

      // Send one consolidated email per patient with all due medications
      if (allDueMedications.length > 0) {
        const user = medications[0].patient.user;
        const success = await this.emailService.sendMedicationReminderEmail(
          user.email,
          user.name,
          allDueMedications,
        );

        if (success) {
          // Update lastSentAt for all medications that were included
          const medicineIds = allDueMedications.map((m) => m.medicineId);
          await this.patientMedicineRepository.update(medicineIds, {
            lastSentAt: now,
          });
          this.logger.log(
            `Reminder sent to ${user.email} for ${allDueMedications.length} medication(s)`,
          );
        }
      }
    }

    this.logger.log('Medication reminder check completed.');
  }
}
