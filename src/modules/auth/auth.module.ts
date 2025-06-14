import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtUserStrategy } from './strategies/jwtUser.strategy';
import { authProviders } from './auth.providers';
import { MailModule } from '../mail/mail.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ResetToken } from './models/reset-token.model';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    SequelizeModule.forFeature([ResetToken]),
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
  providers: [AuthService, LocalStrategy, JwtUserStrategy,...authProviders],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}