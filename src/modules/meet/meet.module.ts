import { Module } from '@nestjs/common';
import { MeetService } from './meet.service';
import { ConfigModule } from '@nestjs/config';
import { MeetController } from './meet.controller';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ConfigModule, MailModule, UsersModule],
  providers: [MeetService],
  exports: [MeetService],
  controllers: [MeetController],
})
export class MeetModule {}