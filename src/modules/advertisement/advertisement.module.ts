import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { JwtUserStrategy } from './strategies/jwtUser.strategy';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdvertisementService } from './advertisement.service';
import { AdvertisementController } from './advertisement.controller';
import { Advertisement } from './models/Advertisement.model';
import { advertisementProviders } from './advertisement.providers';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    SequelizeModule.forFeature([Advertisement]),
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: { expiresIn: '24h' },
    }),
  }),
  ],
  providers: [AdvertisementService, JwtUserStrategy, ...advertisementProviders],
  controllers: [AdvertisementController],
  exports: [AdvertisementService],
})
export class AdvertisementModule {}