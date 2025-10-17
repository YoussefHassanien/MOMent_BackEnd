import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AllergiesTypes } from '../../../../constants/enums';

export class CreateFoodDrugAllergyDto {
  @ApiProperty({
    description: 'The name of the allergy',
    example: 'Penicillin',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The allergy type',
    enum: AllergiesTypes,
    example: AllergiesTypes.DRUG,
  })
  @IsEnum(AllergiesTypes)
  type: AllergiesTypes;
}
