import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EducationSubCategory } from './education-subcategory.entity';
import { MultilingualText } from './education-category.entity';

export type EducationContentType = 'text' | 'video' | 'link';

@Entity('education_content')
export class EducationContent {
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
  @IsInt()
  subCategoryId: number;

  @ManyToOne(() => EducationSubCategory, (subCategory) => subCategory.contents)
  @JoinColumn({ name: 'subCategoryId' })
  subCategory: EducationSubCategory;

  @Column({ type: 'json' })
  @IsObject()
  title: MultilingualText;

  @Column({ type: 'json' })
  @IsObject()
  body: MultilingualText;

  @Column({ type: 'enum', enum: ['text', 'video', 'link'] })
  @IsEnum(['text', 'video', 'link'])
  type: EducationContentType;

  @Column({ nullable: true })
  @IsUrl()
  @IsOptional()
  externalUrl?: string;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;
}
