import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  AllowNull,
  BelongsTo,
  ForeignKey
} from 'sequelize-typescript';
import { User } from 'src/modules/users/models/users.model';
import { Advertisement } from './advertisement.model';

@Table
export class UserLike extends Model {
  @PrimaryKey
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    field: 'user_id'
  })
  userId: number;

  @PrimaryKey
  @ForeignKey(() => Advertisement)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    field: 'ad_id'
  })
  adId: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'liked_at'
  })
  likedAt: Date;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Advertisement)
  advertisement: Advertisement;
}