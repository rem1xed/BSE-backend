import {
  Controller,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { UserComplaintsService } from './UserComplaints.service';
import { JwtUserGuard } from '../auth/guards/jwt-auth.guard';
import { UserComplaintsDto } from './dto/UserComplaints.dto';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';

@Controller('usercomplaints')
export class UserComplaintsController {
  constructor(private userComplaintsService: UserComplaintsService) {}

  @UseGuards(JwtUserGuard)
  @Post(':userId')
  async add(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UserComplaintsDto,
    @Req() req,
  ) {
    dto.fromUserId = req.user.id;
    dto.toUserId = userId;
    dto.status = "In Review";
    return this.userComplaintsService.add(dto);
  }

  @UseGuards(JwtAdminGuard)
  @Delete(':userId')
  async remove(@Param('userId', ParseIntPipe) userId: number, @Req() req) {
    return this.userComplaintsService.remove(req.user.id, userId);
  }

  // @UseGuards(JwtAdminGuard)
  // @Get()
  // async get(@Req() req) {
  //   return this.favoritesService.findByUser(req.user.id);
  // }
}
