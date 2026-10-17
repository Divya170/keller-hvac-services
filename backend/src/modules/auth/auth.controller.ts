import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Request, Response } from 'express';
import { clientIp } from '../../common/utils/client-ip';
import { AdminGuard } from './admin.guard';
import { ADMIN_COOKIE, AuthService, SessionUser } from './auth.service';

class LoginDto {
  @IsEmail({}, { message: 'Enter your admin email address.' })
  email: string;

  @IsString({ message: 'Enter your password.' })
  @MinLength(1, { message: 'Enter your password.' })
  @MaxLength(200)
  password: string;
}

class ChangePasswordDto {
  @IsString({ message: 'Enter your current password.' })
  @MinLength(1, { message: 'Enter your current password.' })
  currentPassword: string;

  @IsString({ message: 'Choose a new password.' })
  @MinLength(10, { message: 'Use at least 10 characters.' })
  @MaxLength(200)
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.auth.login(dto.email, dto.password, clientIp(req));
    res.cookie(ADMIN_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: this.auth.secureCookies, path: '/', maxAge: this.auth.sessionMs });
    return { authenticated: true, user };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ADMIN_COOKIE, { path: '/' });
    return { authenticated: false };
  }

  @Get('me')
  async me(@Req() req: Request) {
    const user = await this.auth.verify((req.cookies as Record<string, string> | undefined)?.[ADMIN_COOKIE]);
    return { authenticated: !!user, user, usingDefaultPassword: user ? await this.auth.usingDefaultPassword() : false };
  }

  @UseGuards(AdminGuard)
  @Post('password')
  @HttpCode(200)
  change(@Body() dto: ChangePasswordDto, @Req() req: Request & { admin?: SessionUser }) {
    return this.auth.changePassword(req.admin!.id, dto.currentPassword, dto.newPassword);
  }
}
