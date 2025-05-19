import { Module } from '@nestjs/common';
import { MeetService } from './meet.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MeetService],
  exports: [MeetService],
})
export class MeetModule {}