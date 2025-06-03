import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './users.model';
import { userProviders } from './users.providers';
import { AdvertisementService } from '../advertisement/advertisement.service';
import { advertisementProviders } from '../advertisement/advertisement.providers';
@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, AdvertisementService, ...userProviders, ...advertisementProviders],
  exports: [UsersService],
})
export class UsersModule {}