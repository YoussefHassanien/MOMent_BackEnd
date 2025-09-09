import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OTP, Patient, RefreshToken, User } from '../../database';
import { EmailService } from '../../services/email.service';
import { AuthController } from './auth.controller';
import { AuthenticationGuard, AuthorizationGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
    TypeOrmModule.forFeature([User, OTP, Patient, RefreshToken]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    AuthenticationGuard,
    AuthorizationGuard,
  ],
  exports: [AuthService, AuthenticationGuard, AuthorizationGuard],
})
export class AuthModule {}
