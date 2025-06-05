import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Favorite } from './models/complaints.model';
import { Advertisement } from '../advertisement/models/Advertisement.model';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite)
    private favoriteModel: typeof Favorite,
    @InjectModel(Advertisement)
    private advertisementModel: typeof Advertisement,
  ) {}

  async add(userId: number, adId: number) {
    const [favorite, created] = await this.favoriteModel.findOrCreate({
      where: { userId, advertisementId: adId },
    });
    return favorite;
  }

  async remove(userId: number, adId: number) {
    const deleted = await this.favoriteModel.destroy({
      where: { userId, advertisementId: adId },
    });

    if (!deleted) {
      throw new NotFoundException('Favorite not found');
    }
    return { success: true };
  }

  async findByUser(userId: number) {
    return this.favoriteModel.findAll({
      where: { userId },
      include: [Advertisement],
    });
  }

  async isFavorite(userId: number, adId: number) {
    const favorite = await this.favoriteModel.findOne({ where: { userId, advertisementId: adId } });
    return !!favorite;
  }
}
