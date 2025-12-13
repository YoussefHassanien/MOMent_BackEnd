import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository, IsNull, Or } from 'typeorm';
import { OTP, PatientMedicine, Patient, User } from '../database';
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

  // @Timeout(5000) // 5 seconds after server startup
  // private async runOnStartup() {
  //   await this.deleteExpiredOtps();
  // }

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
   * Medication reminder cron job - runs every 30 minutes
   * Checks if any medications are due and sends email reminders
   */
  @Cron('0,30 * * * *', {
    name: 'sendMedicationReminders',
    timeZone: 'Africa/Cairo',
  })
  async sendMedicationReminders() {
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
      }).format(now).replace(/\s+/g, ' ').trim();

      this.logger.log(`Current Egypt time: ${egyptTime}, Hour: ${currentHour}`);

      // Get all patient medicines with schedules
      const patientMedicines = await this.patientMedicineRepository.find({
        relations: ['medicine', 'patient'],
      });

      // Group medications by patient
      const patientMedicationsMap = new Map<number, {
        patient: Patient;
        medications: { name: string; dosage: string; time: string }[];
      }>();

      for (const pm of patientMedicines) {
        if (!pm.scheduleTimes || !pm.patient) continue;

        const scheduleTimes = pm.scheduleTimes.split(',').map(t => t.trim());
        
        // Check if any scheduled time matches current hour
        const matchingTimes = scheduleTimes.filter(scheduleTime => {
          // Normalize both times for comparison
          const normalizedSchedule = this.normalizeTime(scheduleTime);
          const normalizedCurrent = this.normalizeTime(currentHour);
          return normalizedSchedule === normalizedCurrent;
        });

        if (matchingTimes.length === 0) continue;

        // Check if we already sent a reminder in the last 55 minutes
        if (pm.lastSentAt) {
          const fiftyFiveMinutesAgo = new Date(now.getTime() - 55 * 60 * 1000);
          if (pm.lastSentAt > fiftyFiveMinutesAgo) {
            this.logger.debug(`Skipping ${pm.medicine?.name} - reminder already sent recently`);
            continue;
          }
        }

        const patientId = pm.patient.id;
        if (!patientMedicationsMap.has(patientId)) {
          patientMedicationsMap.set(patientId, {
            patient: pm.patient,
            medications: [],
          });
        }

        patientMedicationsMap.get(patientId)!.medications.push({
          name: pm.medicine?.name || 'Unknown',
          dosage: pm.dosage || 'As prescribed',
          time: matchingTimes[0],
        });

        // Update lastSentAt
        pm.lastSentAt = now;
        await this.patientMedicineRepository.save(pm);
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
            this.logger.log(`Reminder sent to ${user.email} for ${data.medications.length} medication(s)`);
          }
        } catch (error) {
          this.logger.error(`Failed to send reminder to patient ${patientId}:`, error);
        }
      }

      this.logger.log(`Medication reminder check completed. Sent ${sentCount} emails.`);
    } catch (error) {
      this.logger.error(
        'Failed to send medication reminders',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Normalize time string for comparison
   * Handles formats like "8 AM", "8AM", "08:00 AM", etc.
   */
  private normalizeTime(time: string): string {
    const cleaned = time.toUpperCase().replace(/\s+/g, '').trim();
    // Extract hour and AM/PM
    const match = cleaned.match(/(\d{1,2})(?::\d{2})?(?::?\d{2})?(AM|PM)/);
    if (match) {
      const hour = parseInt(match[1], 10);
      const period = match[2];
      return `${hour}${period}`;
    }
    return cleaned;
  }

  /**
   * Manual trigger for testing - can be called via a test endpoint
   */
  async triggerMedicationRemindersManually(): Promise<{ message: string }> {
    this.logger.log('Manually triggering medication reminders...');
    await this.sendMedicationReminders();
    return { message: 'Medication reminders triggered manually' };
  }
}
