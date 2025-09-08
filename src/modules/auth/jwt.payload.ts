import { Role } from '../../constants/enums';

export class JwtPayload {
  public readonly id: number;
  public readonly email: string;
  public readonly mobileNumber: string;
  public readonly role: Role;
  constructor(id: number, email: string, mobileNumber: string, role: Role) {
    this.id = id;
    this.email = email;
    this.mobileNumber = mobileNumber;
    this.role = role;
  }
}
