import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EducationSubCategory } from './education-subcategory.entity';

export interface MultilingualText {
  en: string;
  ar: string;
}

@Entity('education_category')
export class EducationCategory {
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
  key: string;

  @Column({ type: 'json' })
  @IsObject()
  title: MultilingualText;

  @Column()
  @IsInt()
  @IsPositive()
  order: number;

  @OneToMany(() => EducationSubCategory, (subCategory) => subCategory.category)
  subCategories: EducationSubCategory[];

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;
}
