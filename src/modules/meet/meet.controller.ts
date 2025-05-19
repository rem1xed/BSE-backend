import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { MeetService } from './meet.service';

@Controller('meet')
export class MeetController {
  constructor(private readonly meetService: MeetService) {}

  @Get('test')
  async testMeet(
    
    @Query('user1') user1: number,
    @Query('user2') user2: number
  ) {
    // Optionally, you could fetch user details here using a UsersService
    // and pass user objects to MeetService if needed.
    console.log('user1:', user1, 'user2:', user2);
    return this.meetService.createMeetingForUsers(user1, user2);
  }
}