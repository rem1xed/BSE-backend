import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from 'src/modules/users/users.model';
import { Message } from '../message/message.model';

@Table({
  tableName: 'Chat',
})
export class Chat extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'chat_id',
  })
  chatId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'ad_id',
  })
  adId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'sender_id',
  })
  senderId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'receiver_id',
  })
  receiverId: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'created_at',
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'last_message_at',
  })
  lastMessageAt: Date;

  // Relationships
  @BelongsTo(() => User, { foreignKey: 'sender_id', as: 'sender' })
  sender: User;

  @BelongsTo(() => User, { foreignKey: 'receiver_id', as: 'receiver' })
  receiver: User;

  @HasMany(() => Message, { foreignKey: 'chat_id', as: 'messages' })
  messages: Message[];
}