import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAdminStrategy } from './strategies/jwtAdmin.strategy';
import { MailModule } from '../mail/mail.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { contactFormProviders } from './admin.providers';
import { ContactForm } from './models/contactForm.model';
import { AdvertisementModule } from '../advertisement/advertisement.module';
import { UserComplaints } from '../UserComplaints/models/UserComplaints.model';

@Module({
  imports: [
    UsersModule,
    AdvertisementModule,
    PassportModule,
    SequelizeModule.forFeature([ContactForm]),  //UserComplaints, AdvertisementComplaints
    MailModule,
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
  providers: [AdminService, LocalStrategy, JwtAdminStrategy,...contactFormProviders],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}