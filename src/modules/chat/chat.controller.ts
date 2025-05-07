import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResponseDto, CreateChatDto } from './dto/chat.dto'; 
import { CreateMessageDto, MessageResponseDto } from './dto/message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { userInfo } from 'os';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  async getUserChats(@Request() req): Promise<ChatResponseDto[]> {
    const userId = req.user.userId;
    return this.chatService.getUserChats(userId);
  }

  @Get(':chatId/messages')
  async getChatMessages(
    @Param('chatId') chatId: number,
    @Request() req,
  ): Promise<MessageResponseDto[]> {
    const userId = req.user.userId;
    return this.chatService.getChatMessages(chatId, userId);
  }

  @Post()
  async createChat(@Body() createChatDto: CreateChatDto, @Request() req) {
    // Set the sender ID from the authenticated user
    const completeDto = { 
      ...createChatDto,
      senderId: req.user.id 
    };
    
    return this.chatService.createChat(completeDto);
  }

  @Post('messages')
  async sendMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req,
  ): Promise<any> {
    // Ensure the sender is the current user
    createMessageDto.senderId = req.user.id;
    const message = await this.chatService.sendMessage(createMessageDto);
    return { messageId: message.messageId };
  }
}