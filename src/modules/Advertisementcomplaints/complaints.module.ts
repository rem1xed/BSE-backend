import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Favorite } from './models/complaints.model';
import { FavoritesService } from './complaints.service';
import { FavoritesController } from './complaints.controller';
import { Advertisement } from '../advertisement/models/Advertisement.model';
import { User } from '../users/users.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Favorite, Advertisement, User]),
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
