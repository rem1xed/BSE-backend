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
import { MailService } from '../mail/mail.service';
import { ContactFormDto } from './dto/contactForm.dto';
import { UsersService } from '../users/users.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService) {}

  // ========== ADMIN ENDPOINTS ==========
  // Додаємо префікс /admin для адмінських маршрутів

  @Post('login')
  async adminLogin(
    @Res({ passthrough: true }) res: Response,
    @Body() adminLoginDto: AdminLoginDto,
  ) {
    res.clearCookie('auth_token');

    const jwt = await this.adminService.adminLogin(adminLoginDto);

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
    return this.adminService.registerAdmin(adminRegisterDto);
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


  //  METHOD FOR SENDING QUESTIONS ETC TO ADMIN'S PANEL //

  @Post('send')
  async send(@Body() contactFormDto: ContactFormDto){
    await this.adminService.createForm({...contactFormDto});
    await this.mailService.sendContactForm({...contactFormDto});
  }

  @UseGuards(JwtAdminGuard)
  @Get('get/contact-form')
  async getContactForm(){
    return await this.adminService.showAllForms();
  }

  @UseGuards(JwtAdminGuard)
  @Get('get/users')
  async getUsers(){
    return await this.usersService.getAll();
  }
}
