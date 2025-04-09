import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './modules/email/email.module';

import { AuthService } from './modules/auth/auth.service';
import { AuthModule } from './modules/auth/auth.module';
//import { JwtService } from '@nestjs/jwt';
@Module({
  imports: [EmailModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}
