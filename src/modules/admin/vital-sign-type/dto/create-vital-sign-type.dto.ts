import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { VitalSignsTypes, VitalSignUnits } from '../../../../constants/enums';

export class CreateVitalSignTypeDto {
  @ApiProperty({
    description: 'Type of vital sign',
    enum: VitalSignsTypes,
    example: VitalSignsTypes.BLOOD_GLUCOSE,
    enumName: 'VitalSignsTypes',
  })
  @IsEnum(VitalSignsTypes)
  type: VitalSignsTypes;

  @ApiProperty({
    description: 'Vital sign type minimum valid value',
    example: '80',
  })
  @IsNumber()
  @IsPositive()
  minValidValue: number;

  @ApiProperty({
    description: 'Vital sign type maximum valid value',
    example: '80',
  })
  @IsNumber()
  @IsPositive()
  maxValidValue: number;

  @ApiProperty({
    description: 'Vital sign type high value alert trigger',
    example: '80',
  })
  @IsNumber()
  @IsPositive()
  highValueAlert: number;

  @ApiProperty({
    description: 'Vital sign type low value alert trigger',
    example: '80',
  })
  @IsNumber()
  @IsPositive()
  lowValueAlert: number;

  @ApiProperty({
    description: 'Unit of the vital sign type',
    enum: VitalSignUnits,
    example: VitalSignUnits.BPM,
    enumName: 'VitalSignsTypesUnits',
  })
  @IsEnum(VitalSignUnits)
  unit: VitalSignUnits;
}
