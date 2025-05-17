import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  AllowNull,
  BelongsTo
} from 'sequelize-typescript';
import { User } from 'src/modules/users/models/users.model';
import { Advertisement } from './advertisement.model';

@Table
export class UserLike extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    field: 'user_id'
  })
  userId: number;

  @PrimaryKey
  @BelongsTo(() => User, 'userId')
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

  @BelongsTo(() => Advertisement, 'adId')
  advertisement: Advertisement;
}


