import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
} from 'typeorm';
import { User } from './user.entity';
import { VitalSign } from './vitalSign.entity';
import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsInt,
  IsPositive,
  IsUUID,
  IsOptional,
} from 'class-validator';

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
}
