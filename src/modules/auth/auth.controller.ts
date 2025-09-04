import { Body, Controller, Post, Res, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '../../constants/enums';
import CreateUserDto from './dtos/create-user.dto';
import { Throttle, minutes } from '@nestjs/throttler';
import UserLoginDto from './dtos/user-login.dto';
import { Response } from 'express';
import VerifyOtpDto from './dtos/verify-otp.dto';
import ResendOtpDto from './dtos/resend-otp.dto';

@Throttle({
  default: { ttl: minutes(1), limit: 10, blockDuration: minutes(1) },
})
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly cookiesExpirationTime: number = parseInt(
    process.env.COOKIES_EXPIRATION_TIME!,
  );

  @Post('patient')
  async create(
    @Body() user: CreateUserDto,
    @Res() res: Response,
  ): Promise<Response> {
    const role: Role = Role.PATIENT;
    const { id } = await this.authService.create(user, role);
    return res.status(201).json({ id });
  }

  @Post('login')
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

  @Post('verify-otp')
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { accessToken, refreshToken, user } =
      await this.authService.verifyOtp(verifyOtpDto);

    this.setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({ user });
  }

  @Put('resend-otp')
  async resendOtp(
    @Body() resendOtpDto: ResendOtpDto,
    @Res() res: Response,
  ): Promise<Response> {
    await this.authService.resendOtp(resendOtpDto);
    return res.status(200).json();
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
