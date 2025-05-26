import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AdminService } from '../admin/admin.service'
import { JwtAdminGuard } from './guards/jwt-auth.guard';
import { AdminLoginDto } from './dto/login.dto';
import { AdminRegisterDto } from './dto/register.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly authService: AdminService) {}

  // ========== ADMIN ENDPOINTS ==========
  // Додаємо префікс /admin для адмінських маршрутів

  @Post('login')
  async adminLogin(
    @Res({ passthrough: true }) res: Response,
    @Body() adminLoginDto: AdminLoginDto,
  ) {
    res.clearCookie('auth_token');

    const jwt = await this.authService.adminLogin(adminLoginDto);

    res.cookie('auth_admin_token', jwt.auth_admin_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/', // Змініть на '/' замість '/admin'
    });

    return { user: jwt.user };
  }

  @Post('register')
  async adminRegister(@Body() adminRegisterDto: AdminRegisterDto) {
    return this.authService.registerAdmin(adminRegisterDto);
  }

  @UseGuards(JwtAdminGuard)
  @Get('me')
  getAdminProfile(@Req() req: Request) {
    return req.user;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth_admin_token', { path: '/' }); // потрібно врахувати path для очистки
    return { message: 'Вихід виконано' };
  }
}
