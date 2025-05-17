import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Chat } from './models/chat.model';
import { Message } from './message/message.model';
import { User } from '../users/users.model';
import { CreateChatDto, ChatResponseDto } from './dto/chat.dto';
import { CreateMessageDto, MessageResponseDto } from './dto/message.dto';
import { Op } from 'sequelize';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat)
    private chatModel: typeof Chat,
    @InjectModel(Message)
    private messageModel: typeof Message,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async getUserChats(userId: number): Promise<ChatResponseDto[]> {
    const chats = await this.chatModel.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Message,
          limit: 1,
          order: [['sentAt', 'DESC']],
          attributes: ['message', 'sentAt'],
        },
      ],
      order: [['lastMessageAt', 'DESC']],
    });

    // Format response
    return Promise.all(
      chats.map(async (chat) => {
        const otherUser = chat.senderId === userId ? chat.receiver : chat.sender;
        
        // Count unread messages
        const unreadCount = await this.messageModel.count({
          where: {
            chatId: chat.chatId,
            senderId: { [Op.ne]: userId },
            isRead: false,
          },
        });

        // Get last message
        const lastMessage = chat.messages && chat.messages.length > 0
          ? chat.messages[0].message
          : '';
        
        const lastMessageTime = chat.messages && chat.messages.length > 0
          ? chat.messages[0].sentAt
          : chat.lastMessageAt;

        return {
          chatId: chat.chatId,
          adId: chat.adId,
          otherUserId: otherUser.id,
          otherUserName: `${otherUser.firstName} ${otherUser.lastName}`,
          lastMessage: lastMessage,
          lastMessageTime: lastMessageTime,
          unreadCount: unreadCount,
        };
      })
    );
  }

  async getChatMessages(chatId: number, userId: number): Promise<MessageResponseDto[]> {
    // Check if chat exists and user is part of it
    const chat = await this.chatModel.findOne({
      where: {
        chatId,
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found or you do not have access');
    }

    // Get all messages for the chat
    const messages = await this.messageModel.findAll({
      where: { chatId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['userId', 'firstName', 'lastName'],
        },
      ],
      order: [['sentAt', 'ASC']],
    });

    // Mark messages as read if they were sent to the current user
    await this.messageModel.update(
      { isRead: true },
      {
        where: {
          chatId,
          senderId: { [Op.ne]: userId },
          isRead: false,
        },
      }
    );

    // Format response
    return messages.map((message) => ({
      messageId: message.messageId,
      chatId: message.chatId,
      senderId: message.senderId,
      senderName: `${message.sender.firstName} ${message.sender.lastName}`,
      message: message.message,
      isRead: message.isRead,
      sentAt: message.sentAt,
    }));
  }

  async createChat(createChatDto: CreateChatDto): Promise<Chat> {
    // Check if chat already exists between these users for this ad
    const existingChat = await this.chatModel.findOne({
      where: {
        adId: createChatDto.adId,
        [Op.or]: [
          {
            senderId: createChatDto.senderId,
            receiverId: createChatDto.receiverId,
          },
          {
            senderId: createChatDto.receiverId,
            receiverId: createChatDto.senderId,
          },
        ],
      },
    });

    if (existingChat) {
      return existingChat;
    }

    // Create new chat - explicitly map the properties to avoid type issues
    return this.chatModel.create({
      adId: createChatDto.adId,
      senderId: createChatDto.senderId,
      receiverId: createChatDto.receiverId
    });
  }

  async sendMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    // Check if chat exists
    const chat = await this.chatModel.findByPk(createMessageDto.chatId);
    
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Check if user is part of the chat
    console.log("chat.senderId", chat.get('senderId'));
    console.log("createMessageDto.senderId", createMessageDto.senderId);
    if (chat.get('senderId') !== createMessageDto.senderId) {
      throw new BadRequestException('You are not a participant in this chat');
    }

    // Update the last message time in chat
    await chat.update({ lastMessageAt: new Date() });

    // Create message - explicitly map the properties to avoid type issues
    return this.messageModel.create({
      chatId: createMessageDto.chatId,
      senderId: createMessageDto.senderId,
      message: createMessageDto.message
    });
  }
}
