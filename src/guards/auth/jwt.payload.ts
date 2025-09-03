import { Role } from '../../constants/enums';

class JwtPayload {
  id: number;
  email: string;
  mobileNumber: string;
  role: Role;
}

export default JwtPayload;
