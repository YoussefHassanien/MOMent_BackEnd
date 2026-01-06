import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { OTP, Patient, PatientMedicine, User } from '../database';
import { EmailService } from '../services/email.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(OTP)
    private readonly otpRepository: Repository<OTP>,
    @InjectRepository(PatientMedicine)
    private readonly patientMedicineRepository: Repository<PatientMedicine>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    try {
      // Get the current time in Egypt timezone
      const now = new Date();
      const egyptTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Africa/Cairo',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(now);

      // Extract hour for matching (e.g., "8 AM", "8 PM")
      const currentHour = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Africa/Cairo',
        hour: 'numeric',
        hour12: true,
      })
        .format(now)
        .replace(/\s+/g, ' ')
        .trim();

      this.logger.log(`Current Egypt time: ${egyptTime}, Hour: ${currentHour}`);

      // Get all patient medicines with schedules
      const patientMedicines = await this.patientMedicineRepository.find({
        relations: ['medicine', 'patient'],
      });

      // Group medications by patient
      const patientMedicationsMap = new Map<
        number,
        {
          patient: Patient;
          medicineIds: number[];
          medications: {
            name: string;
            dosage: string;
            time: string;
            startDate: Date;
            endDate: Date;
          }[];
        }
      >();

      const currentHourNormalized = this.normalizeTimeToHour(currentHour);

      for (const pm of patientMedicines) {
        if (!pm.startDate || !pm.endDate || !pm.patient) continue;

        // Check if medication is within valid date range
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(pm.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(pm.endDate);
        endDate.setHours(23, 59, 59, 999);

        if (today < startDate || today > endDate) continue;

        const scheduleTimes = pm.scheduleTimes.split(',').map((t) => t.trim());

        // Check if any scheduled time matches current hour (exact match)
        const matchingTimes = scheduleTimes.filter((scheduleTime) => {
          const scheduleHour = this.normalizeTimeToHour(scheduleTime);
          return scheduleHour === currentHourNormalized;
        });

        if (matchingTimes.length === 0) continue;

        // Check if we already sent a reminder for this specific hour
        if (pm.lastSentAt) {
          const lastSentHour = this.normalizeTimeToHour(
            new Intl.DateTimeFormat('en-US', {
              timeZone: 'Africa/Cairo',
              hour: 'numeric',
              hour12: true,
            }).format(pm.lastSentAt),
          );

          // Check if last sent was today and same hour
          const lastSentDate = new Date(pm.lastSentAt);
          const isSameDay = lastSentDate.toDateString() === now.toDateString();

          if (isSameDay && lastSentHour === currentHourNormalized) {
            this.logger.debug(
              `Skipping ${pm.medicine?.name} - reminder already sent for ${currentHour}`,
            );
            continue;
          }
        }

        const patientId = pm.patient.id;
        if (!patientMedicationsMap.has(patientId)) {
          patientMedicationsMap.set(patientId, {
            patient: pm.patient,
            medicineIds: [],
            medications: [],
          });
        }

        const patientData = patientMedicationsMap.get(patientId)!;
        patientData.medicineIds.push(pm.id);
        patientData.medications.push({
          name: pm.medicine?.name || 'Unknown',
          dosage: pm.dosage || 'As prescribed',
          time: matchingTimes[0],
          startDate: pm.startDate,
          endDate: pm.endDate,
        });
      }

      // Send emails to each patient
      let sentCount = 0;
      for (const [patientId, data] of patientMedicationsMap) {
        try {
          // Get user email
          const user = await this.userRepository.findOne({
            where: { patient: { id: patientId } },
          });

          if (!user) {
            this.logger.warn(`No user found for patient ${patientId}`);
            continue;
          }

          const success = await this.emailService.sendMedicationReminderEmail(
            user.email,
            user.name,
            data.medications,
          );

          if (success) {
            sentCount++;
            this.logger.log(
              `Reminder sent to ${user.email} for ${data.medications.length} medication(s)`,
            );

            // Update lastSentAt ONLY after successful email
            await this.patientMedicineRepository.update(data.medicineIds, {
              lastSentAt: now,
            });
          }
        } catch (error) {
          this.logger.error(
            `Failed to send reminder to patient ${patientId}:`,
            error,
          );
        }
      }

      this.logger.log(
        `Medication reminder check completed. Sent ${sentCount} emails.`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to send medication reminders',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Normalize time string to 24-hour format for proper comparison
   * Handles formats like "8 AM", "8AM", "08:00 AM", etc.
   * Returns hour in 24-hour format (0-23)
   */
  private normalizeTimeToHour(time: string): number {
    const cleaned = time.toUpperCase().replace(/\s+/g, '').trim();
    const match = cleaned.match(/(\d{1,2})(?::\d{2})?(?::?\d{2})?(AM|PM)/);
    if (match) {
      let hour = parseInt(match[1], 10);
      const period = match[2];
      // Convert to 24-hour format
      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }
      return hour;
    }
    return -1; // Invalid time
  }
}
