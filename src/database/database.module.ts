// database.module.ts - виправлена версія
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../modules/users/models/users.model';
// Змінено шляхи імпорту з відносних на абсолютні та уніфіковано їх
import { Advertisement } from '../modules/advertisement/models/advertisement.model';
import { AdImage } from '../modules/advertisement/models/ad-image.model';
import { AdAttribute } from '../modules/advertisement/models/ad-attribute.model';
import { Subcategory } from '../modules/advertisement/models/subcategory.model';
import { UserLike } from '../modules/advertisement/models/user-like.model';
import { AdvertisementService } from 'src/modules/advertisement/advertisement.service';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        models: [User, Advertisement, AdImage, AdAttribute, UserLike, Subcategory],
        autoLoadModels: true,
        synchronize: true,
        // Додано наступні параметри для більшої стабільності
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        logging: false, // Встановіть true для відображення SQL запитів в консолі
      }),
    }),
  ],
  exports: [SequelizeModule], // Важливо експортувати SequelizeModule
})
export class DatabaseModule {}
