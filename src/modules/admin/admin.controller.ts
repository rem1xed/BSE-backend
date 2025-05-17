import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards
  } from '@nestjs/common';
  import { AdminService } from './admin.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { AdminLoginDto } from './dto/admin-login.dto';
  import { AdminRoleGuard } from './guards/admin-role.guard';

  @Controller('admin')
  export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Post('login')
    async login(@Body() loginDto: AdminLoginDto) {
      return this.adminService.validateAdminLogin(loginDto);
    }

    @UseGuards(JwtAuthGuard, AdminRoleGuard)
    @Get('dashboard')
    async getDashboardStats() {
      return this.adminService.getAdminDashboardStats();
    }

    @UseGuards(JwtAuthGuard, AdminRoleGuard)
    @Get('users')
    async getAllUsers() {
      return this.adminService.getAllUsers();
    }

    @UseGuards(JwtAuthGuard, AdminRoleGuard)
    @Get('advertisements')
    async getAllAdvertisements() {
      return this.adminService.getAllAdvertisements();
    }

    @UseGuards(JwtAuthGuard, AdminRoleGuard)
    @Get('chats')
    async getAllChats() {
      return this.adminService.getAllChats();
    }

    @UseGuards(JwtAuthGuard, AdminRoleGuard)
    @Get('chats/:chatId')
    async getChatMessages(@Param('chatId', ParseIntPipe) chatId: number) {
      return this.adminService.getChatMessages(chatId);
    }

    @UseGuards(JwtAuthGuard, AdminRoleGuard)
    @Patch('users/:userId/ban')
    async banUser(@Param('userId', ParseIntPipe) userId: number) {
      return this.adminService.banUser(userId);
    }

    @UseGuards(JwtAuthGuard, AdminRoleGuard)
    @Patch('users/:userId/unban')
    async unbanUser(@Param('userId', ParseIntPipe) userId: number) {
      return this.adminService.unbanUser(userId);
    }

    @UseGuards(JwtAuthGuard, AdminRoleGuard)
    @Delete('advertisements/:adId')
    async deleteAdvertisement(@Param('adId', ParseIntPipe) adId: number) {
      return this.adminService.deleteAdvertisement(adId);
    }

    @UseGuards(JwtAuthGuard, AdminRoleGuard)
    @Patch('advertisements/:adId/toggle-status')
    async toggleAdActiveStatus(@Param('adId', ParseIntPipe) adId: number) {
      return this.adminService.toggleAdActiveStatus(adId);
    }

    @UseGuards(JwtAuthGuard, AdminRoleGuard)
    @Post('create')
    async createAdminUser(
      @Body('email') email: string,
      @Body('password') password: string,
      @Body('secretKey') secretKey: string,
    ) {
      return this.adminService.createAdminUser(email, password, secretKey);
    }
  }
