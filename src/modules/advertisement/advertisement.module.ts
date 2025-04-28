import { Module } from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { AdvertisementController } from './advertisement.controller';

@Module({
  providers: [AdvertisementService],
  controllers: [AdvertisementController]
})
export class AdvertisementModule {}
