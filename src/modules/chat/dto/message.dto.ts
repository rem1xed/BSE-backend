  // message.dto.ts
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsDate } from 'sequelize-typescript';
  export class CreateMessageDto {

    @IsNumber()
    chatId: number;

    @IsOptional()
    senderId?: number;

    @IsString()
    message: string;
  }
  
  export class MessageResponseDto {

    @IsNumber()
    messageId: number;

    @IsNumber()
    chatId: number;

    @IsNumber()
    senderId: number;

    @IsString()
    senderName: string;

    @IsString()
    message: string;

    @IsBoolean()
    isRead: boolean;

    sentAt: Date;
  }