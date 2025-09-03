import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import AuthGuard from './guards/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Role } from './constants/enums';

@Controller({ version: '1' })
export class AppController {
  private readonly cookiesExpirationTime: number = parseInt(
    process.env.COOKIES_EXPIRATION_TIME!,
  );
  @Get()
  // @UseGuards(new AuthGuard(new JwtService(), Role.DOCTOR))
  HealthCheck(@Req() req: Request, @Res() res: Response): Response {
    res.cookie('test', 'testCookie', {
      expires: new Date(Date.now() + this.cookiesExpirationTime),
      httpOnly: true,
      signed: true,
    });

    return res.json({ message: 'Cookie sent!' });
  }

  @Post()
  @UseGuards(new AuthGuard(new JwtService(), Role.DOCTOR))
  HealthChec(@Req() req: Request, @Res() res: Response): Response {
    console.log(req);
    return res.status(200).json({ message: 'test' });
  }
}
