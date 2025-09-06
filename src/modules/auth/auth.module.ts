import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, OTP, Patient, RefreshToken } from '../../database/index';
import { EmailModule } from '../../services/email/email.module';
import { AuthenticationGuard } from './authentication.guard';
import { AuthorizationGuard } from './authorization.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
    TypeOrmModule.forFeature([User, OTP, Patient, RefreshToken]),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthenticationGuard, AuthorizationGuard],
  exports: [AuthenticationGuard, AuthorizationGuard],
})
export class AuthModule {}
