import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Role } from '../../constants/enums';
import { AccessTokenPayload, JwtError } from './interfaces';
import { JwtPayload } from './jwt.payload';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['authorization'];

    if (!authHeader)
      throw new UnauthorizedException({
        message: 'Authorization header not found!',
      });

    if (!authHeader.startsWith('Bearer '))
      throw new UnauthorizedException({
        message: 'Invalid authorization header',
      });

    const accessToken = authHeader.split(' ')[1];

    if (!accessToken)
      throw new UnauthorizedException({ message: 'Access token not found!' });

    try {
      const user = await this.jwtService.verifyAsync<AccessTokenPayload>(
        accessToken,
        {
          secret: this.configService.getOrThrow<string>('accessTokenSecret'),
        },
      );

      req.user = new JwtPayload(
        user.sub,
        user.email,
        user.mobileNumber,
        user.role,
      );

      return true;
    } catch (error: unknown) {
      const accessTokenError = error as JwtError;
      if (accessTokenError.name === 'TokenExpiredError') {
        throw new UnauthorizedException({ message: 'Access token is expired' });
      }
      if (accessTokenError.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({ message: 'Invalid access token!' });
      }
      throw new InternalServerErrorException({
        message: 'Token verification failed',
      });
    }
  }
}

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;

    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
