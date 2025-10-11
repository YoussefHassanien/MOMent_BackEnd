import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsPositive,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('OTPs')
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

  @OneToOne(() => User, (user) => user.otp)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ unique: true })
  @IsInt()
  @IsPositive()
  userId: number;
}
