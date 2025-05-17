import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

import { AdvertisementController } from './advertisement.controller';
import { AdvertisementService } from './advertisement.service';

import { Advertisement } from './models/advertisement.model';
import { AdImage } from './models/ad-image.model';
import { AdAttribute } from './models/ad-attribute.model';
import { UserLike } from './models/user-like.model';
import { Subcategory } from './models/subcategory.model';
import { User } from '../users/models/users.model';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Advertisement,
      AdImage,
      AdAttribute,
      UserLike,
      Subcategory,
      User,
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/ads',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
    UsersModule,
  ],
  controllers: [AdvertisementController],
  providers: [AdvertisementService],
  exports: [AdvertisementService, SequelizeModule],
})
export class AdvertisementModule {}
