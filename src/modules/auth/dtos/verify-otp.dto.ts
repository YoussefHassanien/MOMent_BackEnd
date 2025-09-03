import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsInt,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class VerifyOtpDto {
  @ApiProperty({
    description: 'User global ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'OTP code',
    example: 123456,
    minimum: 100000,
    maximum: 999999,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  otp: number;
}

export default VerifyOtpDto;
