import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../users/users.model';
import { UsersSettingsController } from './user-settings.controller';
import { UsersSettingsService } from './user-settings.service';
import { UserSettings } from './user-settings.model';

@Module({
  imports: [SequelizeModule.forFeature([User, UserSettings])],
  controllers: [UsersSettingsController],
  providers: [UsersSettingsService],
  exports: [UsersSettingsService],
})
export class UsersSettingsModule {}
