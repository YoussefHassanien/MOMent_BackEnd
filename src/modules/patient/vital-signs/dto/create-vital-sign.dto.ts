import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsPositive, IsUUID, IsNumber } from 'class-validator';

export class CreateVitalSignDto {
  @ApiProperty({
    description: 'Vital sign type global ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsUUID()
  typeId: string;

  @ApiProperty({
    description: 'Vital sign value',
    example: '80',
  })
  @IsNumber()
  @IsPositive()
  value: number;
}
