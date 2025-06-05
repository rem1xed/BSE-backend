import { Controller, Query, ParseIntPipe, UseGuards, Post, Param, Request, Body } from '@nestjs/common';
import { MeetService } from './meet.service';
import { JwtUserGuard } from '../auth/guards/jwt-auth.guard';

@Controller('meet')
export class MeetController {
  constructor(private readonly meetService: MeetService) {}

  @UseGuards(JwtUserGuard)
  @Post('generatelink/:id')
  async testMeet(
    @Request() req: any,
    @Param('id', ParseIntPipe) user2Id: number,
    @Body('adLink') adLink: string,
  ) {
    const user1Id = Number(req.user.id);

    if (user1Id === user2Id || !user1Id || !user2Id) {
      return null;
    }

    return this.meetService.createMeetingForUsers(user1Id, user2Id, adLink);
  }
}