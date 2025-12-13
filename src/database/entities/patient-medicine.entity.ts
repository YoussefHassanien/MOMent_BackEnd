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
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Medicine } from './medicine.entity';
import { Patient } from './patient.entity';

export enum MedicationSafetyLabel {
  SAFE = 'SAFE',
  CAUTION = 'CAUTION',
  DANGER = 'DANGER',
}

@Entity('PatientMedicines')
export class PatientMedicine {
  @PrimaryGeneratedColumn()
  @IsInt()
  @IsPositive()
  id: number;

  @Column({ unique: true })
  @Generated('uuid')
  @IsString()
  @IsUUID()
  globalId: string;

  @ManyToOne(() => Patient, (p) => p.id)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  @IsInt()
  @IsPositive()
  @Index()
  patientId: number;

  @ManyToOne(() => Medicine, (m) => m.patientMedicines, { eager: true })
  @JoinColumn({ name: 'medicineId' })
  medicine: Medicine;

  @Column()
  @IsInt()
  @IsPositive()
  @Index()
  medicineId: number;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  dosage: string;

  // store times as simple comma separated values (e.g. "8 AM,8 PM")
  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  scheduleTimes: string;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  duration: string;

  @Column({ type: 'enum', enum: MedicationSafetyLabel, default: MedicationSafetyLabel.CAUTION })
  safetyLabel: MedicationSafetyLabel;

  @Column({ default: false })
  contraindicatedByAllergy: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastSentAt: Date;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;
}
