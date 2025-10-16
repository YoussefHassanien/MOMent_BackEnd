import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class CheckInteractionsDto {
  @ApiProperty({
    description: 'Array of drug names to check for interactions',
    example: ['Aspirin', 'Warfarin'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(10) // reasonable limit
  drugs: string[];
}
