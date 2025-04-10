import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from '../email/email.module';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
      EmailModule,
      JwtModule.register({
          secret: '1234',
          signOptions: { expiresIn: '24h' } // e.g. 30s, 7d, 24h
      }),
      ConfigModule,
      UsersModule,
      EmailModule
  ],
  controllers: [AuthController],
  providers: [AuthService, ConfigService, JwtService]
})
export class AuthModule {}