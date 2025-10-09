import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
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
