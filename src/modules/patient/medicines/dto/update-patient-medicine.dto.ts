import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';

export class UpdatePatientMedicineDto {
  @ApiProperty({
    description: 'Dosage description, e.g. 500 mg',
    required: false,
  })
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiProperty({
    description: 'Array of schedule times as strings',
    required: false,
  })
  @IsOptional()
  @IsArray()
  scheduleTimes?: string[];

  @ApiProperty({
    description: 'Start date for taking this medicine',
    required: false,
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @ApiProperty({
    description: 'End date for taking this medicine',
    required: false,
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  endDate?: Date;
}
