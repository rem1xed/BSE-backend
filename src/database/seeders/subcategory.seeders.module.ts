import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Subcategory } from '../../modules/advertisement/models/subcategory.model';
import { SubcategorySeeder } from './subcategory.seeders';
import { AdImage } from 'src/modules/advertisement/models/ad-image.model';
import { AdAttribute } from 'src/modules/advertisement/models/ad-attribute.model';
import { Advertisement } from 'src/modules/advertisement/models/advertisement.model';
import { UserLike } from 'src/modules/advertisement/models/user-like.model';
import { User } from 'src/modules/users/models/users.model';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: String(configService.get('DB_PASS')),
        database: configService.get('DB_NAME'),
        models: [User, Subcategory, Advertisement, UserLike, AdImage, AdAttribute, Subcategory],
        logging: false
      }),
    }),
    SequelizeModule.forFeature([Subcategory])
  ],
  providers: [SubcategorySeeder],
  exports: [SubcategorySeeder],
})
export class SeederModule {}