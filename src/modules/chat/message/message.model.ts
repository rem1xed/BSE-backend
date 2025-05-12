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
  declare messageId: number;

  @ForeignKey(() => Chat)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'chat_id',
  })
  declare chatId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'sender_id',
  })
  declare senderId: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'message',
  })
  declare message: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'is_read',
  })
  declare isRead: boolean;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'sent_at',
  })
  declare sentAt: Date;

  // Relationships
  @BelongsTo(() => Chat, 'chat_id')
  chat: Chat;

  @BelongsTo(() => User, { foreignKey: 'sender_id', as: 'sender' })
  sender: User;
}