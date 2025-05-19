import { Controller, Get, Body, UseGuards, Req, Patch } from '@nestjs/common';
import { UsersSettingsService } from './user-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettingsDto } from './dto/settings.dto';


@UseGuards(JwtAuthGuard)
@Controller('user/settings')
export class UsersSettingsController {
  constructor(private readonly userService: UsersSettingsService) {}

  @Get()
  async getSettings(@Req() req) {
    return await this.userService.getUserSettings(req.user.id);
  }

  @Patch()
  async updateSettings(@Req() req, @Body() dto: SettingsDto) {
    await this.userService.updateUserSettings(req.user.id, dto);
  }
}