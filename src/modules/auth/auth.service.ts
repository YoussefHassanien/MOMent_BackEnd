import {
  BadRequestException,
  GoneException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomInt, randomUUID } from 'crypto';
import { MoreThan, Repository } from 'typeorm';
import { Role } from '../../constants/enums';
import { OTP, Patient, RefreshToken, User } from '../../database';
import { EmailService } from '../../services/email.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { ResendOtpDto } from './dtos/resend-otp.dto';
import { UserLoginDto } from './dtos/user-login.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { JwtError, RefreshTokenPayload } from './interfaces';
import { JwtPayload } from './jwt.payload';

@Injectable()
export class AuthService {
  private readonly egyptTime: number;
  private readonly rounds: number;
  private readonly tenMinutesAgo: Date;
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpirationTime: string;
  private readonly refreshTokenExpirationTime: string;
  private readonly issuer: string;
  private readonly audience: string;
  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OTP)
    private readonly otpRepository: Repository<OTP>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly configService: ConfigService,
  ) {
    this.egyptTime = this.configService.getOrThrow<number>('egyptTime');
    this.rounds = this.configService.getOrThrow<number>('rounds');
    this.tenMinutesAgo = new Date(
      Date.now() - (10 * 60 * 1000 + this.egyptTime),
    );
    this.accessTokenSecret =
      this.configService.getOrThrow<string>('accessTokenSecret');
    this.refreshTokenSecret =
      this.configService.getOrThrow<string>('refreshTokenSecret');
    this.accessTokenExpirationTime = this.configService.getOrThrow<string>(
      'accessTokenExpirationTime',
    );
    this.refreshTokenExpirationTime = this.configService.getOrThrow<string>(
      'refreshTokenExpirtationTime',
    );
    this.issuer = this.configService.getOrThrow<string>('issuer');
    this.audience = this.configService.getOrThrow<string>('audience');
  }
  async create(user: CreateUserDto, role: Role) {
    if (user.password !== user.confirmPassword) {
      throw new BadRequestException({ message: 'Passwords did not match' });
    }

    const existingUser = await this.userRepository.findOne({
      where: [{ email: user.email }, { mobileNumber: user.mobileNumber }],
    });

    if (existingUser?.email === user.email) {
      throw new BadRequestException({ message: 'This email already exists' });
    }

    if (existingUser?.mobileNumber === user.mobileNumber) {
      throw new BadRequestException({
        message: 'This mobile number already exists',
      });
    }

    const hashedPassword: string = await bcrypt.hash(
      user.password,
      this.rounds,
    );

    const createdUser = this.userRepository.create({
      globalId: randomUUID(),
      email: user.email,
      mobileNumber: user.mobileNumber,
      name: `${user.firstName} ${user.lastName}`,
      password: hashedPassword,
      role: role,
      language: user.language,
    });

    await this.userRepository.save(createdUser);

    const createdPatient = this.patientRepository.create({
      globalId: randomUUID(),
      userId: createdUser.id,
      user: createdUser,
    });

    await this.patientRepository.save(createdPatient);

    const otp = await this.generateOtp(createdUser.id);

    await this.emailService.sendOtpEmail(
      createdUser.email,
      otp,
      createdUser.name,
    );

    return {
      id: createdUser.globalId,
    };
  }

  async login(userLoginDto: UserLoginDto) {
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: userLoginDto.emailOrMobileNumber },
        { mobileNumber: userLoginDto.emailOrMobileNumber },
      ],
    });

    if (!existingUser)
      throw new BadRequestException({
        message: 'Invalid email/mobile number or password',
      });

    const isCorrectPassword = await bcrypt.compare(
      userLoginDto.password,
      existingUser.password,
    );

    if (!isCorrectPassword)
      throw new BadRequestException({
        message: 'Invalid email/mobile number or password',
      });

    const existingOtp = await this.otpRepository.findOneBy({
      userId: existingUser.id,
      used: true,
    });

    if (existingOtp) {
      return await this.generateAccessCredentials(existingUser);
    } else {
      const otp = await this.generateOtp(existingUser.id);
      await this.emailService.sendOtpEmail(
        existingUser.email,
        otp,
        existingUser.name,
      );
      return { id: existingUser.globalId };
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const user = await this.userRepository.findOneBy({
      globalId: verifyOtpDto.id,
    });

    if (!user) throw new UnauthorizedException({ message: 'Unkwon user' });

    const isValidOtp = await this.otpRepository.findOneBy({
      userId: user.id,
      value: verifyOtpDto.otp,
      used: false,
    });

    if (!isValidOtp) throw new BadRequestException({ message: 'Invalid otp' });

    const otpCreationDate = new Date(isValidOtp.createdAt.getTime());

    if (this.tenMinutesAgo > otpCreationDate)
      throw new GoneException({ message: 'Expired otp' });

    await this.otpRepository.update(isValidOtp.id, {
      used: true,
    });

    return await this.generateAccessCredentials(user);
  }

  async resendOtp(resendOtpDto: ResendOtpDto) {
    const user = await this.userRepository.findOneBy({
      globalId: resendOtpDto.id,
    });

    if (!user) throw new UnauthorizedException({ message: 'Unkwon user' });

    const recentOtp = await this.otpRepository.findOneBy({
      userId: user.id,
      used: false,
      createdAt: MoreThan(
        new Date(Date.now() - (1 * 60 * 1000 + this.egyptTime)),
      ),
    });

    if (recentOtp)
      throw new BadRequestException({
        message: 'Please wait one minute before requesting a new otp',
      });

    await this.otpRepository.delete({
      userId: user.id,
    });

    const otp = await this.generateOtp(user.id);

    await this.emailService.sendOtpEmail(user.email, otp, user.name);
  }

  async logout(userId: number) {
    await this.otpRepository.delete({
      userId: userId,
    });
    await this.refreshTokenRepository.delete({
      userId: userId,
    });
    return { message: 'Logged out successfully' };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const { sub: userId } =
        await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
          secret: this.refreshTokenSecret,
        });

      const dbRefreshToken = await this.refreshTokenRepository.findOneBy({
        userId: userId,
        token: refreshToken,
      });
      if (!dbRefreshToken)
        throw new UnauthorizedException({
          message: 'Refresh token not found, Please login again',
        });
      const user = await this.userRepository.findOneBy({
        id: userId,
      });
      if (!user)
        throw new UnauthorizedException({ message: 'User not found!' });
      const newAccessToken = await this.generateAccessToken({
        id: userId,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
      });

      return {
        newAccessToken,
      };
    } catch (error: unknown) {
      const refreshTokenError = error as JwtError;
      if (refreshTokenError.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          message: 'Refresh token is expired. Please login again',
        });
      }
      if (refreshTokenError.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({
          message: 'Invalid refresh token!',
        });
      }
      console.log(error);
      throw new InternalServerErrorException({
        message: 'Access token refresh failed',
      });
    }
  }

  private async generateOtp(userId: number) {
    const otpValue = randomInt(100000, 1000000);
    await this.otpRepository.upsert(
      {
        value: otpValue,
        used: false,
        userId: userId,
      },
      ['userId'],
    );

    return otpValue;
  }

  private async generateAccessToken(payload: JwtPayload) {
    const tokenPayload = {
      sub: payload.id,
      email: payload.email,
      mobileNumber: payload.mobileNumber,
      role: payload.role,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenExpirationTime,
      issuer: this.issuer,
      audience: this.audience,
    });

    return accessToken;
  }

  private async generateRefreshToken(userId: number) {
    const tokenPayload = {
      sub: userId,
    };

    const refreshToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.refreshTokenSecret,
      expiresIn: this.refreshTokenExpirationTime,
      issuer: this.issuer,
      audience: this.audience,
    });

    await this.refreshTokenRepository.upsert(
      {
        userId: userId,
        token: refreshToken,
      },
      ['userId'],
    );

    return refreshToken;
  }

  private async generateAccessCredentials(user: User) {
    const payload = new JwtPayload(
      user.id,
      user.email,
      user.mobileNumber,
      user.role,
    );

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.globalId,
        name: user.name,
        mobileNumber: user.mobileNumber,
        email: user.email,
        language: user.language,
        role: user.role,
      },
    };
  }
}
