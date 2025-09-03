import { Language } from '../../../constants/enums';
import {
  IsEnum,
  IsEmail,
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  MaxLength,
  IsStrongPassword,
} from 'class-validator';

class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('EG')
  @IsNotEmpty()
  mobileNumber: string;

  @IsString()
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsStrongPassword()
  @IsNotEmpty()
  confirmPassword: string;

  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;
}

export default CreateUserDto;
