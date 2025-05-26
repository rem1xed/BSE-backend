import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAdminStrategy } from './strategies/jwtAdmin.strategy';
import { authProviders } from '../auth/auth.providers';
import { MailModule } from '../mail/mail.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    SequelizeModule,
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
  providers: [AdminService, LocalStrategy, JwtAdminStrategy,...authProviders],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}