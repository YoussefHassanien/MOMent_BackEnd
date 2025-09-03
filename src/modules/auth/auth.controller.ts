import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '../../constants/enums';
import CreateUserDto from './dtos/create-user.dto';
import { Throttle, minutes } from '@nestjs/throttler';

@Controller({ version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({
    default: { ttl: minutes(1), limit: 10, blockDuration: minutes(1) },
  })
  @Post('auth/patient')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() user: CreateUserDto) {
    const role: Role = Role.PATIENT;
    const createdUser = await this.authService.create(user, role);
    return createdUser;
  }
}
