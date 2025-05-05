export class CreateChatDto {
    adId: number;
    senderId: number;
    receiverId: number;
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
  
