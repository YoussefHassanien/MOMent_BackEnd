import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { VitalSignType } from './vital_sign_types.entity';

@Entity('vital_signs')
export class VitalSign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  globalId: string;

  @OneToMany(() => VitalSignType, (vst) => vst.vitalSign)
  vitalSignType: VitalSignType[];

  @ManyToOne(() => Patient, (patient) => patient.vitals)
  patient: Patient;

  @Column('float')
  value: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
