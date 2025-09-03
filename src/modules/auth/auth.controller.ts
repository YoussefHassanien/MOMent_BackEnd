import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '../../constants/enums';
import CreateUserDto from './dtos/create-user.dto';
import { Throttle, minutes } from '@nestjs/throttler';
import UserLoginDto from './dtos/user-login.dto';
import { Response } from 'express';

@Controller({ version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly cookiesExpirationTime: number = parseInt(
    process.env.COOKIES_EXPIRATION_TIME!,
  );

  @Throttle({
    default: { ttl: minutes(1), limit: 10, blockDuration: minutes(1) },
  })
  @Post('auth/patient')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() user: CreateUserDto) {
    const role: Role = Role.PATIENT;
    await this.authService.create(user, role);
  }

  @Throttle({
    default: { ttl: minutes(1), limit: 10, blockDuration: minutes(1) },
  })
  @Post('auth/login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(
    @Body() userLoginDto: UserLoginDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { accessToken, refreshToken, user, id } =
      await this.authService.login(userLoginDto);
    if (id) return res.status(201).json({ id });
    res.cookie('accessToken', accessToken, {
      expires: new Date(Date.now() + this.cookiesExpirationTime),
      httpOnly: true,
      signed: true,
    });
    res.cookie('refreshToken', refreshToken, {
      expires: new Date(Date.now() + this.cookiesExpirationTime),
      httpOnly: true,
      signed: true,
    });
    return res.status(201).json({ user });
  }
}
