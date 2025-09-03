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
import VerifyOtpDto from './dtos/verify-otp.dto';

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
    const result = await this.authService.login(userLoginDto);

    if ('id' in result) return res.status(201).json({ id: result.id });

    const { accessToken, refreshToken, user } = result;

    this.setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({ user });
  }

  @Throttle({
    default: { ttl: minutes(1), limit: 10, blockDuration: minutes(1) },
  })
  @Post('auth/verify-otp')
  @UsePipes(new ValidationPipe({ transform: true }))
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { accessToken, refreshToken, user } =
      await this.authService.verifyOtp(verifyOtpDto);

    this.setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({ user });
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const cookieOptions = {
      expires: new Date(Date.now() + this.cookiesExpirationTime),
      httpOnly: true,
      signed: true,
    };

    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);
  }
}
