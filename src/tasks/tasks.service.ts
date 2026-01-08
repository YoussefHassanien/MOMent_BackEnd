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

    // Get current Cairo time components directly
    const cairoHour = parseInt(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'Africa/Cairo',
        hour: 'numeric',
        hour12: false,
      }).format(now),
    );
    const cairoMinute = parseInt(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'Africa/Cairo',
        minute: 'numeric',
      }).format(now),
    );
    const cairoTimeInMinutes = cairoHour * 60 + cairoMinute;

    this.logger.log(
      `Current Cairo time: ${cairoHour}:${cairoMinute.toString().padStart(2, '0')}`,
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
        if (!med.scheduleTimes) continue;

        const scheduleTimes = med.scheduleTimes.split(',').map((t) => t.trim());

        for (const timeStr of scheduleTimes) {
          // Check if reminder was sent recently (within last hour)
          if (med.lastSentAt) {
            const hoursSinceLastSent =
              (now.getTime() - new Date(med.lastSentAt).getTime()) /
              (1000 * 60 * 60);
            if (hoursSinceLastSent < 1) continue;
          }

          // Parse 24-hour format (e.g., "02:40" or "14:30")
          const [hours, minutes = 0] = timeStr.split(':').map(Number);
          const scheduledTimeInMinutes = hours * 60 + minutes;

          // Check if current Cairo time is within 0-10 minutes AFTER scheduled time
          const diff = cairoTimeInMinutes - scheduledTimeInMinutes;
          const isWithinWindow = diff >= 0 && diff <= 10;

          this.logger.log(
            `Checking ${med.medicine.name} at ${timeStr}: scheduled=${scheduledTimeInMinutes}min, now=${cairoTimeInMinutes}min, diff=${diff}, inWindow=${isWithinWindow}`,
          );

          if (isWithinWindow) {
            allDueMedications.push({
              name: med.medicine.name,
              dosage: med.dosage,
              time: timeStr,
              medicineId: med.id,
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
