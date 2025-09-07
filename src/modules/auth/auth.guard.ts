import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import JwtPayload from './jwt.payload';
import { Role } from '../../constants/enums';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

interface JwtError {
  name: string;
  message: string;
}

interface AccessTokenPayload {
  sub: number;
  email: string;
  mobileNumber: string;
  role: Role;
}

interface RefreshTokenPayload {
  sub: number;
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly cookiesExpirationTime: number;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    this.cookiesExpirationTime = this.configService.getOrThrow<number>(
      'cookiesExpirationTime',
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const accessToken: string | undefined = req.signedCookies?.[
      'accessToken'
    ] as string | undefined;
    const refreshToken: string | undefined = req.signedCookies?.[
      'refreshToken'
    ] as string | undefined;

    if (!accessToken)
      throw new UnauthorizedException({ message: 'Access token not found!' });

    if (!refreshToken)
      throw new UnauthorizedException({ message: 'Refresh token not found!' });

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
      const jwtError = error as JwtError;
      if (jwtError.name === 'TokenExpiredError') {
        try {
          const { sub: userId } =
            await this.jwtService.verifyAsync<RefreshTokenPayload>(
              refreshToken,
              {
                secret:
                  this.configService.getOrThrow<string>('refreshTokenSecret'),
              },
            );

          const databaseRefreshToken =
            await this.authService.validateRefreshToken(refreshToken, userId);

          if (!databaseRefreshToken)
            throw new UnauthorizedException({
              message: 'Invalid refresh token',
            });

          const user = await this.authService.findUserById(userId);

          if (!user)
            throw new UnauthorizedException({ message: 'User not found!' });

          const newAccessToken = await this.authService.generateAccessToken({
            id: userId,
            email: user.email,
            mobileNumber: user.mobileNumber,
            role: user.role,
          });

          const res = context.switchToHttp().getResponse<Response>();
          res.cookie('accessToken', newAccessToken, {
            expires: new Date(Date.now() + this.cookiesExpirationTime),
            httpOnly: true,
            signed: true,
            secure:
              this.configService.getOrThrow<string>('environment') !== 'dev',
            sameSite: 'strict' as const,
          });

          const typedReq = context.switchToHttp().getRequest<Request>();
          typedReq.user = {
            id: user.id,
            email: user.email,
            mobileNumber: user.mobileNumber,
            role: user.role,
          };

          return true;
        } catch (refreshError: any) {
          const refreshJwtError = refreshError as JwtError;
          if (refreshJwtError.name === 'TokenExpiredError') {
            throw new UnauthorizedException({
              message: 'Refresh token expired. Please login again',
            });
          }
          if (refreshJwtError.name === 'JsonWebTokenError') {
            throw new UnauthorizedException({
              message: 'Invalid refresh token!',
            });
          }
          throw new UnauthorizedException({ message: 'Token refresh failed' });
        }
      }
      if (jwtError.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({ message: 'Invalid access token!' });
      }
      throw new UnauthorizedException({ message: 'Token verification failed' });
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
    const user = request.user;

    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
