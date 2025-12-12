import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MultilingualTextDto } from './create-category.dto';

export class CreateContentDto {
  @ApiProperty({ example: '4b3e381c-1c8a-442d-a229-4b89d1ba1a09' })
  @IsUUID()
  subCategoryId: string;

  @ApiProperty({ type: MultilingualTextDto })
  @ValidateNested()
  @Type(() => MultilingualTextDto)
  @IsObject()
  title: MultilingualTextDto;

  @ApiProperty({ type: MultilingualTextDto })
  @ValidateNested()
  @Type(() => MultilingualTextDto)
  @IsObject()
  body: MultilingualTextDto;

  @ApiProperty({ enum: ['text', 'video', 'link'], example: 'text' })
  @IsEnum(['text', 'video', 'link'])
  type: 'text' | 'video' | 'link';

  @ApiProperty({
    required: false,
    example: 'https://youtube.com/watch?v=example',
  })
  @IsUrl()
  @IsOptional()
  externalUrl?: string;
}
