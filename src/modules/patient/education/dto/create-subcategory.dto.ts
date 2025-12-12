import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MultilingualTextDto } from './create-category.dto';

export class CreateSubCategoryDto {
  @ApiProperty({ example: '4b3e381c-1c8a-442d-a229-4b89d1ba1a09' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ type: MultilingualTextDto })
  @ValidateNested()
  @Type(() => MultilingualTextDto)
  @IsObject()
  title: MultilingualTextDto;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  order: number;

  @ApiProperty({
    required: false,
    example: '5c4f492d-2d9b-553e-b33a-5c9ad2cb2b10',
  })
  @IsUUID()
  @IsOptional()
  parentSubCategoryId?: string;
}
