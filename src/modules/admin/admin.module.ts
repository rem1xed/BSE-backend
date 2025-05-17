import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/models/users.model';
import { Advertisement } from '../advertisement/models/advertisement.model';
import { Admin } from './admin.model';
import { Chat } from '../chat/models/chat.model';
import { Message } from '../chat/message/message.model';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Advertisement, Admin, Chat, Message]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminRoleGuard],
  exports: [AdminService],
})
export class AdminModule {}
