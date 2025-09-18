import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReportsType } from '../../constants/enums';
import { Patient } from './patient.entity';

@Entity('Medical-Reports')
export class MedicalReport {
  @PrimaryGeneratedColumn()
  @IsInt()
  @IsPositive()
  id: number;

  @Column({ unique: true })
  @Generated('uuid')
  @IsString()
  @IsUUID()
  globalId: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column({ type: 'enum', enum: ReportsType })
  @IsEnum(ReportsType)
  type: ReportsType;

  @Column()
  @IsDate()
  date: Date;

  @Column()
  @IsUrl()
  url: string;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  @ManyToOne(() => Patient, (patient) => patient.medicalReports)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  @IsInt()
  @IsPositive()
  patientId: number;
}
