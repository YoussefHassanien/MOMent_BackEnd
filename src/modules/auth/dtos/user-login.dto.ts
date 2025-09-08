import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

class UserLoginDto {
  @ApiProperty({
    description: 'User email or mobile number',
    example: 'john.doe@example.com',
  })
  @IsString()
  @IsNotEmpty()
  emailOrMobileNumber: string;

  @ApiProperty({
    description: 'User password',
    example: 'StrongPassword123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export default UserLoginDto;
