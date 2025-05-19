import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/modules/users/models/users.model';
import { AdAttribute } from 'src/modules/advertisement/models/ad-attribute.model';
import { AdImage } from 'src/modules/advertisement/models/ad-image.model';
import { Advertisement } from 'src/modules/advertisement/models/advertisement.model';
import { Subcategory } from 'src/modules/advertisement/models/subcategory.model';
import { UserLike } from 'src/modules/advertisement/models/user-like.model';

@Module({
  imports: [
    ConfigModule, // потрібно для передачі в useFactory
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
        models: [User, Advertisement, UserLike, AdImage, AdAttribute, Subcategory],
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}