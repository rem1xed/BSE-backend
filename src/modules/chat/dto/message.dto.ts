  // message.dto.ts
  export class CreateMessageDto {
    chatId: number;
    senderId: number;
    message: string;
  }
  
  export class MessageResponseDto {
    messageId: number;
    chatId: number;
    senderId: number;
    senderName: string;
    message: string;
    isRead: boolean;
    sentAt: Date;
  }