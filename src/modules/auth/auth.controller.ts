import { 
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Res({ passthrough: true }) res: Response, @Body() loginDto: LoginDto) {
    const jwt = await this.authService.login(loginDto); // отримаєш токен
    res.cookie('auth_token', jwt.auth_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: (24 * 60 * 60 * 1000) * 7, // 7 днів
      path: '/',
    });
    return { user: jwt.user }; // можна віддати користувача без токена в тілі
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.authService.forgotPassword(forgotPasswordDto);
    return { message: 'Код для скидання пароля надіслано на вашу електронну пошту' };
  }

  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto): Promise<{ valid: boolean }> {
    const valid = await this.authService.verifyCode(verifyCodeDto);
    return { valid };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    await this.authService.resetPassword(resetPasswordDto);
    return { message: 'Пароль успішно змінено' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    return (req as any).user;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }
}