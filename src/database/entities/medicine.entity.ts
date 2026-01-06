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
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PatientMedicine } from './patient-medicine.entity';

@Entity('Medicines')
export class Medicine {
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
  @IsString()
  @IsNotEmpty()
  @Index()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  use: string;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  category: string;

  // Pregnancy safety per trimester (store the raw CSV value)
  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  pregnancyFirst: string;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  pregnancySecond: string;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  pregnancyThird: string;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  breastfeeding: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  contraindications: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  useWithCaution: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  contactYourPhysician: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  interactions: string;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  @OneToMany(() => PatientMedicine, (pm) => pm.medicine)
  patientMedicines: PatientMedicine[];
}
