import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResponseDto, CreateChatDto } from './dto/chat.dto';
import { CreateMessageDto, MessageResponseDto } from './dto/message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  async getUserChats(@Request() req): Promise<ChatResponseDto[]> {
    console.log('JWT payload in getUserChats:', req.user);
    const userId = req.user.id;
    return this.chatService.getUserChats(userId);
  }

  @Get(':chatId/messages')
  async getChatMessages(
    @Request() req,
    @Param('chatId') chatId: string, // Changed to string for proper parsing
  ): Promise<MessageResponseDto[]> {
    console.log('JWT payload in getChatMessages:', req.user);
    console.log('ChatId param:', chatId);

    // Parse and validate chatId
    const parsedChatId = parseInt(chatId, 10);

    const userId = req.user.id;
    return this.chatService.getChatMessages(parsedChatId, userId);
  }

  @Post()
  async createChat(@Body() createChatDto: CreateChatDto, @Request() req) {
    console.log('JWT payload in createChat:', req.user);

    const userId = req.user.userId || req.user.id || req.user.sub;

    const completeDto = {
      ...createChatDto,
      senderId: userId
    };

    return this.chatService.createChat(completeDto);
  }

  @Post('messages')
  async sendMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req,
  ): Promise<any> {
    console.log('JWT payload in sendMessage:', req.user);

    createMessageDto.senderId = req.user.id;

    const message = await this.chatService.sendMessage(createMessageDto);

    return {
        messageId: message.messageId ,
        chatId: message.chatId,
        sentAt: message.sentAt
      };
  }
}
