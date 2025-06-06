// src/modules/chat/dto/chat.dto.ts

import { IsNumber, IsOptional } from 'class-validator';

export class CreateChatDto {
  @IsNumber()
  adId: number;

  @IsNumber()
  receiverId: number;

  @IsOptional()
  senderId?: number;
}

export class ChatResponseDto {
  chatId: number;
  adId: number;
  otherUserId: number;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}
