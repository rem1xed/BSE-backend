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
  userService: any;
  constructor(
    @InjectModel(Chat)
    private chatModel: typeof Chat,
    @InjectModel(Message)
    private messageModel: typeof Message,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async getUserChats(userId: number): Promise<ChatResponseDto[]> {
    console.log('Getting chats for userId:', userId);
    
    if (!userId || isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const chats = await this.chatModel.findAll({
      where: {
        [Op.or]: [
          { 
            senderId: userId,
            receiverId: userId,
          },
        ],
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Message,
          limit: 1,
          order: [['sentAt', 'DESC']],
          attributes: ['messageId', 'chatId', 'message', 'sentAt'],
        },
      ],
      order: [['lastMessageAt', 'DESC']],
    });

    // Format response
    return Promise.all(
      chats.map(async (chat) => {
        const otherUser = chat.senderId === userId ? chat.receiver : chat.sender;
        
        
        const unreadCount = await this.messageModel.count({
          where: {
            chatId: chat.chatId,
            senderId: { [Op.ne]: userId },
            isRead: false,
          },
        });

        
        const lastMessage = chat.messages && chat.messages.length > 0
          ? chat.messages[0].message
          : '';
        
        const lastMessageTime = chat.messages && chat.messages.length > 0
          ? chat.messages[0].sentAt
          : chat.lastMessageAt;

        return {
          chatId: chat.chatId,
          adId: chat.adId,
          otherUserId: otherUser?.id,
          otherUserName: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User',
          lastMessage: lastMessage,
          lastMessageTime: lastMessageTime,
          unreadCount: unreadCount,
        };
      })
    );
  }

  async getChatMessages(chatId: number, userId: number): Promise<MessageResponseDto[]> {
    console.log('Getting messages for chatId:', chatId, 'userId:', userId);
    // Check if chat exists and user is part of it

    if (!chatId || isNaN(chatId)) {
      throw new BadRequestException('Invalid chat ID');
    }

    const chat = await this.chatModel.findOne({
      where: {
        chatId : chatId,
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
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        },
      ],
      order: [['sentAt', 'ASC']],
    });
  
    console.log('Retrieved messages count:', messages.length);
  
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
  


      const messageResponses = messages.map((message) => {

      const plainMessage = message.toJSON ? message.toJSON() : message;
      console.log(`Processing message ${plainMessage.messageId}, sender info:`, plainMessage.sender);
      
      let senderName = 'Unknown User';
      if (plainMessage.sender) {
        senderName = `${plainMessage.sender.firstName || ''} ${plainMessage.sender.lastName || ''}`.trim();
      }
      
      return {
        messageId: plainMessage.messageId,
        chatId: plainMessage.chatId,
        senderId: plainMessage.senderId,
        senderName: senderName || 'Unknown User',
        message: plainMessage.message,
        isRead: plainMessage.isRead,
        sentAt: plainMessage.sentAt,
      };
    });

    return messageResponses;
  }

  async createChat(createChatDto: CreateChatDto): Promise<Chat> {

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
