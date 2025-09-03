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
import { VitalSign } from './vital_sign.entity';
import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsInt,
  IsPositive,
  IsUUID,
} from 'class-validator';

@Entity('patients')
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

  @Column()
  @IsDate()
  @IsNotEmpty()
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
  @JoinColumn()
  user: User;

  @OneToMany(() => VitalSign, (vs) => vs.patient)
  vitals: VitalSign[];
}
