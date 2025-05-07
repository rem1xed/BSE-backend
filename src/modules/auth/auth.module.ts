import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtConstants } from '../../constants/constants';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { EmailModule } from '../email/email.module';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    EmailModule,
    forwardRef(() => AccountModule),
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}