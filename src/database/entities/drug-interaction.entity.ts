import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InteractionCategory } from '../../constants/enums';

@Entity('DrugInteractions')
export class DrugInteraction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @IsNotEmpty()
  drug1: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @IsNotEmpty()
  drug2: string;

  @Column({
    type: 'enum',
    enum: InteractionCategory,
  })
  @IsEnum(InteractionCategory)
  category: InteractionCategory;

  @Column({ type: 'text' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
