import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalStrategy } from 'src/modules/auth/strategies/local.strategy';
import { jwtConstants } from 'src/constants/constants';
import { AuthController } from './auth.controller';
import { JwtStrategy } from 'src/modules/auth/strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';


@Module({
  imports: [
    UsersModule,
    PassportModule,
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
