import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle, minutes } from '@nestjs/throttler';
import { Request } from 'express';
import { Role } from '../../constants/enums';
import { AuthenticationGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { RefreshAccessTokenDto } from './dtos/refresh-access-token.dto';
import { ResendOtpDto } from './dtos/resend-otp.dto';
import { UserLoginDto } from './dtos/user-login.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { JwtPayload } from './jwt.payload';

@Throttle({
  default: { ttl: minutes(1), limit: 10, blockDuration: minutes(1) },
})
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('patient')
  async create(@Body() createUserDto: CreateUserDto) {
    const role: Role = Role.PATIENT;
    return await this.authService.create(createUserDto, role);
  }

  @Post('login')
  async login(@Body() userLoginDto: UserLoginDto) {
    return await this.authService.login(userLoginDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.authService.verifyOtp(verifyOtpDto);
  }

  @Put('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    await this.authService.resendOtp(resendOtpDto);
  }

  @Delete('logout')
  @UseGuards(AuthenticationGuard)
  async logout(@Req() req: Request) {
    const user = req.user as JwtPayload;

    return await this.authService.logout(user.id);
  }

  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshAccessTokenDto) {
    return await this.authService.refreshAccessToken(
      refreshTokenDto.refreshToken,
    );
  }
}
