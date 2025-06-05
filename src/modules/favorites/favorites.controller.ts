import { Controller, Post, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtUserGuard } from '../auth/guards/jwt-auth.guard'; // або відповідний guard

@Controller('favorites')
@UseGuards(JwtUserGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Post(':adId')
  async add(@Param('adId') adId: number, @Req() req) {
    return this.favoritesService.add(req.user.id, adId);
  }

  @Delete(':adId')
  async remove(@Param('adId') adId: number, @Req() req) {
    return this.favoritesService.remove(req.user.id, adId);
  }

  @Get()
  async list(@Req() req) {
    return this.favoritesService.findByUser(req.user.id);
  }

  @Get(':adId/is-favorite')
  async isFavorite(@Param('adId') adId: number, @Req() req) {
    return this.favoritesService.isFavorite(req.user.id, adId);
  }
}