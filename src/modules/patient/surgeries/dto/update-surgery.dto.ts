import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString, MaxDate } from 'class-validator';

export class UpdateSurgeryDto {
  @ApiPropertyOptional({
    description: 'The name of the surgery',
    example: 'Appendectomy',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    description: 'Date of surgery',
    example: '2019-07-11',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @MaxDate(new Date(), {
    message: 'Date must be in the past',
  })
  date?: Date;
}