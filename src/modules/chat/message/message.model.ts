import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from 'src/modules/users/users.model';
import { Chat } from '../models/chat.model';

@Table({
  tableName: 'Messages',
})
export class Message extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'message_id',
  })
  messageId: number;

  @ForeignKey(() => Chat)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'chat_id',
  })
  chatId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'sender_id',
  })
  senderId: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'message',
  })
  message: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'is_read',
  })
  isRead: boolean;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'sent_at',
  })
  sentAt: Date;

  // Relationships
  @BelongsTo(() => Chat, 'chat_id')
  chat: Chat;

  @BelongsTo(() => User, 'sender_id')
  sender: User;
}