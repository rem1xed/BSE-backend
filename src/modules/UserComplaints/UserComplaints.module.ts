import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserComplaints } from './models/UserComplaints.model';
import { UserComplaintsService } from './UserComplaints.service';
import { UserComplaintsController } from './UserComplaints.controller';
import { Advertisement } from '../advertisement/models/Advertisement.model';
import { User } from '../users/users.model';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    SequelizeModule.forFeature([UserComplaints, Advertisement, User]),
    UsersModule
  ],
  controllers: [UserComplaintsController],
  providers: [UserComplaintsService],
  exports: [UserComplaintsService],
})
export class UsersComplaintsModule {}
