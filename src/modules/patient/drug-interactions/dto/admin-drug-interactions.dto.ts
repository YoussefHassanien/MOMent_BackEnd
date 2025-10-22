import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum InteractionCategory {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  X = 'X',
}

export class CreateDrugInteractionDto {
  @ApiProperty({
    description: 'First drug name',
    example: 'Aspirin',
  })
  @IsString()
  @IsNotEmpty()
  drug1: string;

  @ApiProperty({
    description: 'Second drug name',
    example: 'Warfarin',
  })
  @IsString()
  @IsNotEmpty()
  drug2: string;

  @ApiProperty({
    description: 'Interaction category',
    enum: InteractionCategory,
    example: 'C',
  })
  @IsEnum(InteractionCategory)
  category: InteractionCategory;

  @ApiProperty({
    description: 'Description of the interaction',
    example: 'Monitor therapy',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateDrugInteractionDto {
  @ApiProperty({
    description: 'First drug name',
    example: 'Aspirin',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  drug1?: string;

  @ApiProperty({
    description: 'Second drug name',
    example: 'Warfarin',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  drug2?: string;

  @ApiProperty({
    description: 'Interaction category',
    enum: InteractionCategory,
    example: 'C',
    required: false,
  })
  @IsEnum(InteractionCategory)
  category?: InteractionCategory;

  @ApiProperty({
    description: 'Description of the interaction',
    example: 'Monitor therapy',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  description?: string;
}