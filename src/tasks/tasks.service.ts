import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { OTP } from '../database';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(OTP)
    private readonly otpRepository: Repository<OTP>,
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
}
