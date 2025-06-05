import {
  Column,
  Model,
  Table,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/users.model';

interface UserComplaintsCreationAttrs {
  fromUserId: number;
  toUserId: number;
  reason: string;
  fromUserName: string;
  toUserName: string;
}

@Table({ tableName: 'UserComplaints', timestamps: true })
export class UserComplaints extends Model<UserComplaints, UserComplaintsCreationAttrs> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  fromUserId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  fromUserName?: string;
  
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  toUserId: number;
  
  @Column({ type: DataType.STRING, allowNull: false })
  toUserName?: string;
  
  @Column({ type: DataType.STRING(1000), allowNull: false })
  reason: string;

  @Column({ type: DataType.STRING, allowNull: false })
  status: string;
}
