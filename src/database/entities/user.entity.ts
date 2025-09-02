import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { OTP } from './otp.entity';
import { Patient } from './patient.entity';

enum Role {
  ADMIN = 'ADMIN',
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
}
enum Language {
  ENGLISH = 'ENGLISH',
  ARABIC = 'ARABIC',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  globalId: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  mobileNumber: number;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ type: 'enum', enum: Language })
  language: Language;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OTP, (otp) => otp.user)
  otps: OTP[];

  @OneToOne(() => Patient, (patient) => patient.user)
  patient: Patient;
}
