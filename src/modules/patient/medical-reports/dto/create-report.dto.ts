import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsString, MaxDate } from 'class-validator';
import { ReportsType } from '../../../../constants/enums';
export class CreateReportDto {
  @ApiProperty({
    description: 'The name of the report',
    example: 'Chest x-ray',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The report type',
    enum: ReportsType,
    example: ReportsType.LAB,
  })
  @IsEnum(ReportsType)
  type: ReportsType;

  @ApiProperty({
    description: 'Date of report creation',
    example: '1995-09-12',
  })
  @Type(() => Date)
  @IsDate()
  @MaxDate(new Date(), {
    message: 'Date must be in the past',
  })
  date: Date;
}
