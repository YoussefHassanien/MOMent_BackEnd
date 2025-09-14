import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class UpdateVitalSignDto {
  @ApiProperty({
    description: 'Vital sign global ID (UUID)',
    example: '4b3e381c-1c8a-442d-a229-4b89d1ba1a09',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Vital sign value',
    example: '80',
  })
  @IsNumber()
  @IsPositive()
  value: number;
}
