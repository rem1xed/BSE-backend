import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserComplaints } from './models/UserComplaints.model';
import { UserComplaintsDto } from './dto/UserComplaints.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class UserComplaintsService {
  constructor(
    @InjectModel(UserComplaints)
    private userComplaintsModel: typeof UserComplaints,
    private usersService: UsersService,
  ) {}

  async add(dto: UserComplaintsDto) {
    const fromUser = await this.usersService.findById(dto.fromUserId);
    const toUser = await this.usersService.findById(dto.toUserId);

    if (!fromUser || !toUser) {
      throw new NotFoundException('User not found');
    }

    return this.userComplaintsModel.create({
      fromUserId: dto.fromUserId,
      toUserId: dto.toUserId,
      reason: dto.reason,
      fromUserName: `${fromUser.firstName} ${fromUser.lastName}`,
      toUserName: `${toUser.firstName} ${toUser.lastName}`,
    });
  }

  async remove(fromUserId: number, toUserId: number) {
    const deleted = await this.userComplaintsModel.destroy({
      where: { fromUserId, toUserId },
    });

    if (!deleted) {
      throw new NotFoundException('Complaint not found');
    }
    return { success: true };
  }
}
