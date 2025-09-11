import { Role } from '../../constants/enums';

export interface JwtError {
  name: string;
  message: string;
}

export interface AccessTokenPayload {
  sub: number;
  email: string;
  mobileNumber: string;
  role: Role;
}

export interface RefreshTokenPayload {
  sub: number;
}
