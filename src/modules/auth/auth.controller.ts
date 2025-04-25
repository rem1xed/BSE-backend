import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.authService.login(user);

    res.cookie('jwt', token.access_token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false, // постав true, якщо у тебе HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 день
    });

    return { message: 'Login successful' };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // 🆕 Перевірка залогіненого користувача
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    return (req as any).user;
}
}