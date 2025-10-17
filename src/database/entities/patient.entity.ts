import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Allergy } from './allergy.entity';
import { MedicalReport } from './medical-report.entity';
import { Surgery } from './surgery.entity';
import { User } from './user.entity';
import { VitalSign } from './vital-sign.entity';

@Entity('Patients')
export class Patient {
  @PrimaryGeneratedColumn()
  @IsInt()
  @IsPositive()
  id: number;

  @Column({ unique: true })
  @Generated('uuid')
  @IsString()
  @IsUUID()
  globalId: string;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  dateOfBirth: Date;

  @CreateDateColumn()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.patient)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ unique: true })
  @IsInt()
  @IsPositive()
  userId: number;

  @OneToMany(() => VitalSign, (vs) => vs.patient)
  vitals: VitalSign[];

  @OneToMany(() => MedicalReport, (mr) => mr.patient)
  medicalReports: MedicalReport[];

  @OneToMany(() => Surgery, (s) => s.patient)
  surgeries: Surgery[];

  @OneToMany(() => Allergy, (a) => a.patient)
  allergies: Allergy[];
}
