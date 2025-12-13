import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '../constants/enums';
import { AuthenticationGuard, AuthorizationGuard } from '../modules/auth/auth.guard';
import { Roles } from '../modules/auth/roles.decorator';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Test endpoint to manually trigger medication reminders
   * This is useful for testing the reminder system without waiting for the cron job
   */
  @Post('trigger-medication-reminders')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Manually trigger medication reminders (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Medication reminders triggered successfully',
  })
  async triggerMedicationReminders() {
    return await this.tasksService.triggerMedicationRemindersManually();
  }
}
