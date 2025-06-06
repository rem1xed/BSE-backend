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
  if (!userId || isNaN(userId)) {
    throw new BadRequestException('Invalid user ID');
  }

  // Find all chats where the user is either sender or receiver
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
        required: false
      },
      {
        model: User,
        as: 'receiver',
        attributes: ['id', 'firstName', 'lastName'],
        required: false
      },
    ],
    order: [['lastMessageAt', 'DESC']],
  });
  
  if (chats.length === 0) {
    return [];
  }

  // Process each chat to format the response
  const chatResponses = await Promise.all(chats.map(async (chat) => {
    // Convert to plain object
    const plainChat = chat.toJSON ? chat.toJSON() : chat;
    
    // Determine the other user (not the current user)
    const isCurrentUserSender = plainChat.senderId === userId;
    const otherUser = isCurrentUserSender ? plainChat.receiver : plainChat.sender;
    
    // Get last message for this chat
    const lastMessage = await this.messageModel.findOne({
      where: { chatId: plainChat.chatId },
      order: [['sentAt', 'DESC']],
      attributes: ['messageId', 'message', 'sentAt'],
    });
    
    // Count unread messages
    const unreadCount = await this.messageModel.count({
      where: {
        chatId: plainChat.chatId,
        senderId: { [Op.ne]: userId },
        isRead: false,
      },
    });
    
    // Format other user name
    let otherUserName = 'Unknown User';
    let otherUserId = 0;
    
    if (otherUser) {
      otherUserId = otherUser.id;
      if (otherUser.firstName || otherUser.lastName) {
        otherUserName = `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 'Unknown User';
      }
    }
    
    // Format last message info
    const lastMessagePlain = lastMessage?.toJSON ? lastMessage.toJSON() : lastMessage;
    
    return {
      chatId: plainChat.chatId,
      adId: plainChat.adId,
      otherUserId: otherUserId,
      otherUserName: otherUserName,
      lastMessage: lastMessagePlain?.message || '',
      lastMessageTime: lastMessagePlain?.sentAt || plainChat.lastMessageAt,
      unreadCount: unreadCount,
    };
  }));

  return chatResponses;
}

  async getChatMessages(chatId: number, userId: number): Promise<MessageResponseDto[]> {
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
    if (!createChatDto.senderId) {
      throw new BadRequestException('Sender ID is required');
    }

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

    // Check if user is part of the chat (дозволяємо і sender, і receiver)
    if (
      chat.get('senderId') !== createMessageDto.senderId &&
      chat.get('receiverId') !== createMessageDto.senderId
    ) {
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
