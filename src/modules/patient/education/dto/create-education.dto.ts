import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { educationTopicsTypes } from '../../../../constants/enums';

export class CreateEducationDto {
  @ApiProperty({
    description: 'Name of the education resource',
    example: 'Understanding Gestational Diabetes',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Category of the education resource',
    example: 'Diabetes Management',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: 'Type of the education resource',
    enum: educationTopicsTypes,
    example: educationTopicsTypes.article,
  })
  @IsEnum(educationTopicsTypes)
  type: educationTopicsTypes;

  @ApiProperty({
    description: 'URL to the education resource',
    example: 'https://example.com/article/gestational-diabetes',
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;
}
