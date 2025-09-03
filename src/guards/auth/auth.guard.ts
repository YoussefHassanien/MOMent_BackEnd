/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  ExecutionContext,
  CanActivate,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../constants/enums';
import JwtPayload from './jwt.payload';

@Injectable()
class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly role: Role,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token: string | undefined = request.signedCookies['accessToken'];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const user = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.ACCESS_TOKEN_SECRET as string,
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      if (user.role !== this.role) {
        throw new ForbiddenException('Permission not granted');
      }

      request.user = user;

      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw new InternalServerErrorException();
    }
  }
}

export default AuthGuard;
