import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
} from 'typeorm';
import { Patient } from './patient.entity';
import { VitalSignType } from './vital_sign_types.entity';
import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsInt,
  IsPositive,
  IsUUID,
  IsNumber,
} from 'class-validator';

@Entity('vital_signs')
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

  @OneToMany(() => VitalSignType, (vst) => vst.vitalSign)
  vitalSignType: VitalSignType[];

  @ManyToOne(() => Patient, (patient) => patient.vitals)
  patient: Patient;

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
