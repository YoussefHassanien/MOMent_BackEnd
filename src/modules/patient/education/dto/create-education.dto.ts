import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TopicContent } from '../../../../database/entities/education.entity';

export class TopicContentDto implements TopicContent {
  @ApiProperty({
    description: 'Type of content',
    enum: ['text', 'image', 'video'],
    example: 'text',
  })
  @IsString()
  @IsNotEmpty()
  type: 'text' | 'image' | 'video';

  @ApiProperty({
    description: 'Text content (for text and image types)',
    example: 'This is the main content of the article...',
    required: false,
  })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({
    description: 'Image URL (for image type)',
    example: 'https://example.com/images/gestational-diabetes.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'Video URL (for video type)',
    example: 'https://youtube.com/watch?v=example',
    required: false,
  })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({
    description: 'Structured sections with headings and content',
    example: [
      { heading: 'Introduction', content: 'Overview of the topic...' },
      { heading: 'Symptoms', content: 'Common symptoms include...' },
    ],
    required: false,
  })
  @IsOptional()
  @IsObject({ each: true })
  sections?: { heading: string; content: string }[];
}

export class CreateEducationDto {
  @ApiProperty({
    description: 'Title of the education topic',
    example: 'Understanding Gestational Diabetes',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Brief description of the topic',
    example:
      'Learn about gestational diabetes, its causes, symptoms, and management.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Category of the education topic',
    example: 'Diabetes Management',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: 'Full content of the topic',
    type: TopicContentDto,
  })
  @ValidateNested()
  @Type(() => TopicContentDto)
  @IsObject()
  content: TopicContentDto;

  @ApiProperty({
    description: 'Estimated read time in minutes',
    example: 5,
    required: false,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  readTime?: number;

  @ApiProperty({
    description: 'Publication date (ISO 8601 format)',
    example: '2025-10-25T10:00:00Z',
    required: false,
  })
  @IsString()
  @IsOptional()
  publishedAt?: string;
}
