import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [JwtModule.register({}), ConfigModule, UsersModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
