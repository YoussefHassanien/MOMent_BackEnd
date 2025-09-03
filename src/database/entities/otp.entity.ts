import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import {
  IsNotEmpty,
  IsDate,
  IsInt,
  IsPositive,
  IsBoolean,
} from 'class-validator';

@Entity('otps')
export class OTP {
  @PrimaryGeneratedColumn()
  @IsInt()
  @IsPositive()
  id: number;

  @Column()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  value: number;

  @Column({ default: false })
  @IsNotEmpty()
  @IsBoolean()
  used: boolean;

  @CreateDateColumn()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.otps)
  user: User;
}
