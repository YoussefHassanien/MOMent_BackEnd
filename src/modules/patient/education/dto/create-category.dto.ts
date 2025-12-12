import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MultilingualTextDto {
  @ApiProperty({ example: 'Nutrition' })
  @IsString()
  @IsNotEmpty()
  en: string;

  @ApiProperty({ example: 'التغذية' })
  @IsString()
  @IsNotEmpty()
  ar: string;
}

export class CreateCategoryDto {
  @ApiProperty({ example: 'A' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ type: MultilingualTextDto })
  @ValidateNested()
  @Type(() => MultilingualTextDto)
  @IsObject()
  title: MultilingualTextDto;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  order: number;
}
