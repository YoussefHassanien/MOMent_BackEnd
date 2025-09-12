import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsString, IsUUID, MaxDate } from 'class-validator';

export class CreateAgeDto {
  @ApiProperty({
    description: 'Age global ID (UUID)',
    example: '4b3e381c-1c8a-442d-a229-4b89d1ba1a09',
  })
  @IsString()
  @IsUUID()
  typeId: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '1995-09-12',
  })
  @Type(() => Date)
  @IsDate()
  @MaxDate(new Date(Date.now() - 15 * 365.25 * 24 * 60 * 60 * 1000), {
    message: 'Person must be at least 15 years old',
  })
  dateOfBirth: Date;
}
