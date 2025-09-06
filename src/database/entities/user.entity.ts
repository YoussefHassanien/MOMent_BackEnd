import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  Generated,
} from 'typeorm';
import { OTP } from './otp.entity';
import { Patient } from './patient.entity';
import { Role, Language } from '../../constants/enums';
import {
  IsEnum,
  IsEmail,
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsStrongPassword,
  IsDate,
  IsInt,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { RefreshToken } from './refreshToken.entity';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  @IsInt()
  @IsPositive()
  id: number;

  @Column({ unique: true })
  @Generated('uuid')
  @IsString()
  @IsUUID()
  globalId: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Column({ unique: true })
  @IsPhoneNumber('EG')
  @IsNotEmpty()
  mobileNumber: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsStrongPassword()
  password: string;

  @Column({ type: 'enum', enum: Role })
  @IsEnum(Role)
  role: Role;

  @Column({ type: 'enum', enum: Language })
  @IsEnum(Language)
  language: Language;

  @CreateDateColumn()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;

  @OneToOne(() => OTP, (otp) => otp.user)
  otp: OTP;

  @OneToOne(() => Patient, (patient) => patient.user)
  patient: Patient;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken: RefreshToken;
}
