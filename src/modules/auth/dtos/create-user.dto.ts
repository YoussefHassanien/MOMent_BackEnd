import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
import { Language } from '../../../constants/enums';

export class CreateUserDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User mobile number',
    example: 1234567890,
  })
  @IsPhoneNumber('EG')
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty({
    description: 'User password',
    example: 'StrongPassword123!',
    minLength: 8,
  })
  @IsString()
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Password confirmation',
    example: 'StrongPassword123!',
  })
  @IsString()
  @IsStrongPassword()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({
    description: 'User preferred language',
    enum: Language,
    example: Language.ENGLISH,
  })
  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;
}
