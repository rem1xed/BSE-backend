import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserSettings } from './user-settings.model';
import { SettingsDto } from './dto/settings.dto';

@Injectable()
export class UsersSettingsService {
  constructor(
    @InjectModel(UserSettings)
    private settingsModel: typeof UserSettings,
  ) {}

  async getUserSettings(userId: number): Promise<UserSettings> {
    const settings = await this.settingsModel.findOne({ where: { userId } });

    if (!settings) {
      throw new NotFoundException('Налаштування не знайдено');
    }

    return settings;
  }

  async updateUserSettings(userId: number, dto: SettingsDto): Promise<UserSettings> {
    let settings = await this.settingsModel.findOne({ where: { userId } });

    if (settings) {
      await settings.update(dto);
    } else {
      settings = await this.settingsModel.create({
      userId,
      ...dto,
    } as SettingsDto & { userId: number });
    }

    return settings;
  }
}
