import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsObject,
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
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EducationCategory } from './education-category.entity';
import { EducationContent } from './education-content.entity';
import { MultilingualText } from './education-category.entity';

@Entity('education_subcategory')
export class EducationSubCategory {
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
  categoryId: number;

  @ManyToOne(() => EducationCategory, (category) => category.subCategories)
  @JoinColumn({ name: 'categoryId' })
  category: EducationCategory;

  @Column({ type: 'json' })
  @IsObject()
  title: MultilingualText;

  @Column()
  @IsInt()
  @IsPositive()
  order: number;

  @Column({ nullable: true })
  @IsInt()
  @IsOptional()
  parentSubCategoryId?: number;

  @ManyToOne(() => EducationSubCategory, (sub) => sub.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parentSubCategoryId' })
  parent?: EducationSubCategory;

  @OneToMany(() => EducationSubCategory, (sub) => sub.parent)
  children: EducationSubCategory[];

  @OneToMany(() => EducationContent, (content) => content.subCategory)
  contents: EducationContent[];

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;
}
