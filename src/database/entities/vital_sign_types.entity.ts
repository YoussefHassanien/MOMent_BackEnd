import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VitalSign } from './vital_sign.entity';

enum VitalSignsTypes {
  SYSTOLIC_PRESSURE = 'SYSTOLIC_PRESSURE',
  DIASTOLIC_PRESSURE = 'DIASTOLIC_PRESSURE',
  BLOOD_GLUCOSE = 'BLOOD_GLUCOSE',
  HEIGHT = 'HEIGHT',
  WEIGHT = 'WEIGHT',
  HEART_RATE = 'HEART_RATE',
  AGE = 'AGE',
}

@Entity('vital_sign_types')
export class VitalSignType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  globalId: string;

  @Column({ type: 'enum', enum: VitalSignsTypes })
  type: VitalSignsTypes;

  @Column('float')
  minValue: number;

  @Column('float')
  maxValue: number;

  @ManyToOne(() => VitalSign, (vs) => vs.vitalSignType)
  vitalSign: VitalSign;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
