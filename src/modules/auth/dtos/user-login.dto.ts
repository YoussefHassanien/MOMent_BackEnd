import { IsString, IsNotEmpty } from 'class-validator';

class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  emailOrMobileNumber: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export default UserLoginDto;
