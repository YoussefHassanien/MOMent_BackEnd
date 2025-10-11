import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Min, Max } from 'class-validator';

export class GetVitalSignHistoryDto {
  @ApiProperty({
    description: 'Vital sign type global ID (UUID)',
    example: '4b3e381c-1c8a-442d-a229-4b89d1ba1a09',
  })
  @IsUUID()
  typeId: string;

  @ApiProperty({
    description:
      'Number of days to look back (default: 14 days, max: 365 days)',
    example: 14,
    required: false,
    minimum: 1,
    maximum: 365,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number = 14;
}
