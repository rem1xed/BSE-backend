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
import { AdminLoginDto } from './dto/adminLogin.dto';
import { AdminRegisterDto } from './dto/adminRegister.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  //ADMIN END-POINTS


  @Post('admin-login')
  async adminLogin(@Res({ passthrough: true }) res: Response, @Body() adminLoginDto: AdminLoginDto) {
    const jwt = await this.authService.adminLogin(adminLoginDto); // отримаєш токен
    res.cookie('auth_admin_token', jwt.auth_admin_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: (24 * 60 * 60 * 1000) * 1, // 1 день
      path: '/',
    });
    return { user: jwt.user }; // можна віддати користувача без токена в тілі
  }

  @Post('admin-register')
  async adminRegister(@Body() adminRegisterDto: AdminRegisterDto) {
    return this.authService.register(adminRegisterDto);
  }

  // @Post('admin-logout')
  // adminLogout(@Res({ passthrough: true }) res: Response) {
  //   return this.authService.logout(res);
  // }

  //USER END-POINTS
  
  
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