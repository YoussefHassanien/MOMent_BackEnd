import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, minutes } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { Role } from '../../constants/enums';
import { AuthenticationGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { ResendOtpDto } from './dtos/resend-otp.dto';
import { UserLoginDto } from './dtos/user-login.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { JwtPayload } from './jwt.payload';

@Throttle({
  default: { ttl: minutes(1), limit: 10, blockDuration: minutes(1) },
})
@Controller('auth')
export class AuthController {
  private readonly cookiesExpirationTime: number;
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.cookiesExpirationTime = this.configService.getOrThrow<number>(
      'cookiesExpirationTime',
    );
  }

  @Post('patient')
  async create(@Body() user: CreateUserDto) {
    const role: Role = Role.PATIENT;
    return await this.authService.create(user, role);
  }

  @Post('login')
  async login(@Body() userLoginDto: UserLoginDto, @Res() res: Response) {
    const result = await this.authService.login(userLoginDto);

    if ('id' in result) return res.status(201).json({ id: result.id });

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.status(201).json({ user: result.user });
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Res() res: Response) {
    const { accessToken, refreshToken, user } =
      await this.authService.verifyOtp(verifyOtpDto);

    this.setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({ user });
  }

  @Put('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    await this.authService.resendOtp(resendOtpDto);
  }

  @Delete('logout')
  @UseGuards(AuthenticationGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    const user = req.user as JwtPayload;

    await this.authService.logout(user.id);

    const cookieOptions = {
      httpOnly: true,
      signed: true,
      secure: this.configService.getOrThrow<string>('environment') !== 'dev',
      sameSite:
        this.configService.getOrThrow<string>('environment') !== 'dev'
          ? ('none' as const)
          : ('lax' as const),
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return res.status(200).json({ message: 'Logged out successfully' });
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const cookieOptions = {
      expires: new Date(Date.now() + this.cookiesExpirationTime),
      httpOnly: true,
      signed: true,
      secure: this.configService.getOrThrow<string>('environment') !== 'dev',
      sameSite:
        this.configService.getOrThrow<string>('environment') !== 'dev'
          ? ('none' as const)
          : ('lax' as const),
    };

    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);
  }
}
