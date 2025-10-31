import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdatePatientMedicineDto {
  @ApiProperty({ description: 'Dosage description, e.g. 500 mg', required: false })
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiProperty({ description: 'Array of schedule times as strings', required: false })
  @IsOptional()
  @IsArray()
  scheduleTimes?: string[];

  @ApiProperty({ description: 'Duration (optional) e.g. 7 days', required: false })
  @IsOptional()
  @IsString()
  duration?: string;
}
