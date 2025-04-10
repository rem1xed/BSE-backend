import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from 'src/modules/users/dto/dto.login';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
