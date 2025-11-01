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
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type TopicContentType = 'text' | 'image' | 'video';

export interface TopicContent {
  type: TopicContentType;
  text?: string; // For text and image types
  imageUrl?: string; // For image type
  videoUrl?: string; // For video type
  sections?: { heading: string; content: string }[]; // For structured text content
}

@Entity('education')
export class Education {
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
  @IsString()
  @IsNotEmpty()
  title: string;

  @Column({ unique: true })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  category: string;

  @Column({ type: 'json' })
  @IsObject()
  content: TopicContent;

  @Column({ nullable: true })
  @IsInt()
  @IsPositive()
  @IsOptional()
  readTime?: number; // in minutes

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  publishedAt?: string;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;
}
