import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Favorite } from './models/favorites.model';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
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
