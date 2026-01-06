import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePatientMedicineDto {
  @ApiProperty({ description: 'Medicine global id from medicines database' })
  @IsUUID()
  @IsNotEmpty()
  medicineId: string;

  @ApiProperty({ description: 'Dosage description, e.g. 500 mg' })
  @IsString()
  @IsNotEmpty()
  dosage: string;

  @ApiProperty({
    description: 'Array of schedule times as strings, e.g. ["8 AM","8 PM"]',
  })
  @IsArray()
  @ArrayNotEmpty()
  scheduleTimes: string[];

  @ApiProperty({
    description: 'Start date for taking this medicine',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: 'End date for taking this medicine',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}
