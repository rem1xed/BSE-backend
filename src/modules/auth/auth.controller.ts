import { Controller, Post, Body, UseGuards, Get,Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { Response } from 'express';

import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() { email }: { email: string }): Promise<void> {
    return this.authService.forgotPassword(email);
}

  @Post('reset-password')
  async resetPassword(
    @Body() { token, password }: { token: string; password: string }
): Promise<void> {
    return this.authService.resetPassword(token, password);
}

  // 🆕 Перевірка залогіненого користувача
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    return (req as any).user;
}
}
