import {
  Body,
  Controller,
  Post,
  Res,
  Put,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '../../constants/enums';
import CreateUserDto from './dtos/create-user.dto';
import { Throttle, minutes } from '@nestjs/throttler';
import UserLoginDto from './dtos/user-login.dto';
import { Response, Request } from 'express';
import VerifyOtpDto from './dtos/verify-otp.dto';
import ResendOtpDto from './dtos/resend-otp.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationGuard } from './authentication.guard';
import { AuthorizationGuard } from './authorization.guard';
import { Roles } from './roles.decorator';

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
  async create(@Body() user: CreateUserDto): Promise<{ id: string }> {
    const role: Role = Role.PATIENT;
    return await this.authService.create(user, role);
  }

  @Post('login')
  async login(
    @Body() userLoginDto: UserLoginDto,
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.authService.login(userLoginDto);

    if ('id' in result) return res.status(201).json({ id: result.id });

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.status(201).json({ user: result.user });
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
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    await this.authService.resendOtp(resendOtpDto);
  }

  @Delete('logout')
  @UseGuards(AuthenticationGuard)
  async logout(@Req() req: Request, @Res() res: Response): Promise<Response> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    await this.authService.logout(req.user.id);

    const cookieOptions = {
      httpOnly: true,
      signed: true,
      secure: this.configService.getOrThrow<string>('environment') !== 'dev',
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return res.status(200).json({ message: 'Logged out successfully' });
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
      secure: this.configService.getOrThrow<string>('environment') !== 'dev',
      sameSite: 'strict' as const,
    };

    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);
  }
}
