import { Module } from '@nestjs/common';
import { MeetService } from './meet.service';
import { ConfigModule } from '@nestjs/config';
import { MeetController } from './meet.controller';

@Module({
  imports: [ConfigModule],
  providers: [MeetService],
  exports: [MeetService],
  controllers: [MeetController],
})
export class MeetModule {}