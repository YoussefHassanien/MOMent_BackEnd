import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdateVitalSignDto {
  @ApiProperty({
    description: 'Vital sign value',
    example: '80',
  })
  @IsNumber()
  @IsPositive()
  value: number;
}
