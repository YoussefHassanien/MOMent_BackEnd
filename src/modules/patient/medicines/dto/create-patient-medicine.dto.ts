import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreatePatientMedicineDto {
  @ApiProperty({ description: 'Medicine global id from medicines database' })
  @IsUUID()
  @IsNotEmpty()
  medicineId: string;

  @ApiProperty({ description: 'Dosage description, e.g. 500 mg' })
  @IsString()
  @IsNotEmpty()
  dosage: string;

  @ApiProperty({ description: 'Array of schedule times as strings, e.g. ["8 AM","8 PM"]' })
  @IsArray()
  @ArrayNotEmpty()
  scheduleTimes: string[];

  @ApiProperty({ description: 'Duration (optional) e.g. 7 days', required: false })
  @IsOptional()
  @IsString()
  duration?: string;
}
