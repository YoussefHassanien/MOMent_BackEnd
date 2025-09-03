import { Role } from '../../constants/enums';

interface JwtPayload {
  id: number;
  email: string;
  mobileNumber: number;
  role: Role;
}

export default JwtPayload;
