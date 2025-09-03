import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsInt,
  IsPositive,
} from 'class-validator';

class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  otp: number;
}

export default VerifyOtpDto;
