import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Chat } from './models/chat.model';
import { Message } from './message/message.model';
import { User } from '../users/models/users.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Chat, 
      Message, 
      User
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}