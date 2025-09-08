import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
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
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { VitalSignType } from './vitalSignType.entity';

@Entity('Vital-Signs')
export class VitalSign {
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
  @IsInt()
  @IsPositive()
  typeId: number;

  @ManyToOne(() => VitalSignType, (vitalSignType) => vitalSignType.vitalSigns)
  @JoinColumn({ name: 'typeId' })
  vitalSignType: VitalSignType;

  @ManyToOne(() => Patient, (patient) => patient.vitals)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  @IsInt()
  @IsPositive()
  patientId: number;

  @Column('float')
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  value: number;

  @CreateDateColumn()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;
}
