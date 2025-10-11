import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, MaxDate } from 'class-validator';

export class CreateSurgeryDto {
  @ApiProperty({
    description: 'The name of the surgery',
    example: 'Appendectomy',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Date of surgery',
    example: '2019-07-11',
  })
  @Type(() => Date)
  @IsDate()
  @MaxDate(new Date(), {
    message: 'Date must be in the past',
  })
  date: Date;
}

