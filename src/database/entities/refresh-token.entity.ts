import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import {
  IsNotEmpty,
  IsDate,
  IsInt,
  IsPositive,
  IsBoolean,
  IsString,
} from 'class-validator';

@Entity('Refresh-Tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  @IsInt()
  @IsPositive()
  id: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  @IsPositive()
  token: string;

  @OneToOne(() => User, (user) => user.refreshToken)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ unique: true })
  @IsInt()
  @IsPositive()
  userId: number;

  @CreateDateColumn()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;
}
