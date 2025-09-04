import {
  BadRequestException,
  GoneException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import CreateUserDto from './dtos/create-user.dto';
import UserLoginDto from './dtos/user-login.dto';
import { Role } from '../../constants/enums';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities/user.entity';
import { OTP } from '../../database/entities/otp.entity';
import { randomUUID } from 'crypto';
import { AppDataSource } from '../../database/data-source';
import { randomInt } from 'crypto';
import { LessThan, MoreThan } from 'typeorm';
import JwtPayload from '../../guards/auth/jwt.payload';
import { JwtService } from '@nestjs/jwt';
import VerifyOtpDto from './dtos/verify-otp.dto';
import ResendOtpDto from './dtos/resend-otp.dto';
import { EmailService } from '../../services/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}
  private readonly egyptTime: number = parseInt(process.env.EGYPT_TIME!);
  private readonly rounds: number = 12;
  private readonly tenMinutesAgo = new Date(
    Date.now() - (10 * 60 * 1000 + this.egyptTime),
  );
  async create(user: CreateUserDto, role: Role) {
    if (user.password !== user.confirmPassword) {
      throw new BadRequestException('Passwords did not match');
    }

    const existingUser = await AppDataSource.manager.findOne(User, {
      where: [{ email: user.email }, { mobileNumber: user.mobileNumber }],
    });

    if (existingUser?.email === user.email) {
      throw new BadRequestException('This email already exists');
    }

    if (existingUser?.mobileNumber === user.mobileNumber) {
      throw new BadRequestException('This mobile number already exists');
    }

    const hashedPassword: string = await bcrypt.hash(
      user.password,
      this.rounds,
    );

    const createdUser = AppDataSource.manager.create(User, {
      globalId: randomUUID(),
      email: user.email,
      mobileNumber: user.mobileNumber,
      name: `${user.firstName} ${user.lastName}`,
      password: hashedPassword,
      role: role,
      language: user.language,
    });

    await AppDataSource.manager.save(createdUser);
    return {
      id: createdUser.globalId,
    };
  }

  async login(userLoginDto: UserLoginDto) {
    const existingUser = await AppDataSource.manager.findOne(User, {
      where: [
        { email: userLoginDto.emailOrMobileNumber },
        { mobileNumber: userLoginDto.emailOrMobileNumber },
      ],
    });

    if (!existingUser)
      throw new BadRequestException('Invalid email/mobile number or password');

    const isCorrectPassword = await bcrypt.compare(
      userLoginDto.password,
      existingUser.password,
    );

    if (!isCorrectPassword)
      throw new BadRequestException('Invalid email/mobile number or password');

    const existingOtp = await AppDataSource.manager.findOne(OTP, {
      where: {
        user: { id: existingUser.id },
        used: true,
      },
    });

    if (existingOtp) {
      return await this.generateAccessCredentials(existingUser);
    } else {
      const expiredOtps = await AppDataSource.manager.find(OTP, {
        where: {
          user: { id: existingUser.id },
          used: false,
          createdAt: LessThan(this.tenMinutesAgo),
        },
      });

      if (expiredOtps.length) {
        expiredOtps.forEach((otp, i) => {
          AppDataSource.manager
            .delete(OTP, otp.id)
            .then(() => {
              console.log(`Otp number ${i + 1} is deleted successfully`);
            })
            .catch((error) => {
              console.log(`Error deleting expired otp number ${i + 1}`, error);
            });
        });
      }

      const validOtp = await AppDataSource.manager.findOne(OTP, {
        where: {
          user: { id: existingUser.id },
          used: false,
          createdAt: MoreThan(this.tenMinutesAgo),
        },
      });

      if (!validOtp) await this.generateOtp(existingUser);
    }

    return { id: existingUser.globalId };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const user = await AppDataSource.manager.findOneBy(User, {
      globalId: verifyOtpDto.id,
    });

    if (!user) throw new UnauthorizedException('Unkwon user');

    const isValidOtp = await AppDataSource.manager.findOne(OTP, {
      where: {
        user: { id: user.id },
        value: verifyOtpDto.otp,
        used: false,
      },
    });

    if (!isValidOtp) throw new BadRequestException('Invalid otp');

    const otpCreationDate = new Date(
      isValidOtp.createdAt.getTime() + this.egyptTime,
    );
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    if (tenMinutesAgo > otpCreationDate) throw new GoneException('Expired otp');

    await AppDataSource.manager.update(OTP, isValidOtp.id, {
      used: true,
    });

    return await this.generateAccessCredentials(user);
  }

  async resendOtp(resendOtpDto: ResendOtpDto) {
    const user = await AppDataSource.manager.findOneBy(User, {
      globalId: resendOtpDto.id,
    });

    if (!user) throw new UnauthorizedException('Unkwon user');

    const recentOtp = await AppDataSource.manager.findOne(OTP, {
      where: {
        user: { id: user.id },
        used: false,
        createdAt: MoreThan(new Date(Date.now() - 1 * 60 * 1000)),
      },
    });

    if (recentOtp)
      throw new BadRequestException(
        'Please wait one minute before requesting a new otp',
      );

    await AppDataSource.manager.delete(OTP, {
      user: user,
    });

    await this.generateOtp(user);
  }

  private async generateOtp(user: User) {
    const otpValue = randomInt(100000, 1000000);
    const newOtp = AppDataSource.manager.create(OTP, {
      value: otpValue,
      used: false,
      user: user,
    });

    await AppDataSource.manager.save(newOtp);
  }

  private async generateAccessToken(payload: JwtPayload) {
    const tokenPayload = {
      sub: payload.id,
      email: payload.email,
      mobileNumber: payload.mobileNumber,
      role: payload.role,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME,
    });

    return accessToken;
  }

  private async generateRefreshToken(payload: JwtPayload) {
    const tokenPayload = {
      sub: payload.id,
      email: payload.email,
      mobileNumber: payload.mobileNumber,
      role: payload.role,
    };

    const refreshToken = await this.jwtService.signAsync(tokenPayload, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
    });

    return refreshToken;
  }

  private async generateAccessCredentials(user: User) {
    const payload = new JwtPayload();
    payload.email = user.email;
    payload.id = user.id;
    payload.mobileNumber = user.mobileNumber;
    payload.role = user.role;

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.globalId,
        name: user.name,
        mobileNumber: user.mobileNumber,
        email: user.email,
        role: user.role,
      },
    };
  }
}
