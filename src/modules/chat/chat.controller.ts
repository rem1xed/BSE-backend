import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResponseDto, CreateChatDto } from './dto/chat.dto';
import { CreateMessageDto, MessageResponseDto } from './dto/message.dto';
import { JwtUserGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chats')
@UseGuards(JwtUserGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  async getUserChats(@Request() req): Promise<ChatResponseDto[]> {
    const userId = req.user.id;
    return this.chatService.getUserChats(userId);
  }

  @Get(':chatId/messages')
  async getChatMessages(
    @Request() req,
    @Param('chatId') chatId: string,
  ): Promise<MessageResponseDto[]> {
    const parsedChatId = parseInt(chatId, 10);
    if (isNaN(parsedChatId)) {
      throw new BadRequestException('Invalid chatId');
    }

    const userId = req.user.id;
    return this.chatService.getChatMessages(parsedChatId, userId);
  }

  @Post()
  async createChat(@Body() createChatDto: CreateChatDto, @Request() req) {
    const userId = req.user.id;

    const completeDto = {
      ...createChatDto,
      senderId: userId,
    };

    return this.chatService.createChat(completeDto); // якщо метод очікує senderId
  }

  @Post('messages')
  async sendMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req,
  ): Promise<any> {
    createMessageDto.senderId = req.user.id;

    const message = await this.chatService.sendMessage(createMessageDto);

    return {
      messageId: message.messageId,
      chatId: message.chatId,
      sentAt: message.sentAt,
    };
  }
}
