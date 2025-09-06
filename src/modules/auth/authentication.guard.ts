/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import JwtPayload from './jwt.payload';

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
    const req = context.switchToHttp().getRequest();
    const accessToken: string | undefined = req.signedCookies['accessToken'];
    const refreshToken: string | undefined = req.signedCookies['refreshToken'];

    if (!accessToken)
      throw new UnauthorizedException({ message: 'Access token not found!' });

    if (!refreshToken)
      throw new UnauthorizedException({ message: 'Refresh token not found!' });

    try {
      const user = await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.getOrThrow<string>('accessTokenSecret'),
      });

      req.user = {
        id: user.sub,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
      };

      return true;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        try {
          const { sub: userId } = await this.jwtService.verifyAsync<{
            sub: number;
          }>(refreshToken, {
            secret: this.configService.getOrThrow<string>('refreshTokenSecret'),
          });

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

          const res = context.switchToHttp().getResponse();
          res.cookie('accessToken', newAccessToken, {
            expires: new Date(Date.now() + this.cookiesExpirationTime),
            httpOnly: true,
            signed: true,
            secure:
              this.configService.getOrThrow<string>('environment') !== 'dev',
            sameSite: 'strict' as const,
          });

          const req = context.switchToHttp().getRequest();
          req.user = {
            id: user.id,
            email: user.email,
            mobileNumber: user.mobileNumber,
            role: user.role,
          };

          return true;
        } catch (error: any) {
          if (error.name === 'TokenExpiredError') {
            throw new UnauthorizedException({
              message: 'Refresh token expired. Please login again',
            });
          }
          if (error.name === 'JsonWebTokenError') {
            throw new UnauthorizedException({
              message: 'Invalid refresh token!',
            });
          }
          throw new UnauthorizedException({ message: 'Token refresh failed' });
        }
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({ message: 'Invalid access token!' });
      }
      throw new UnauthorizedException({ message: 'Token verification failed' });
    }
  }
}
