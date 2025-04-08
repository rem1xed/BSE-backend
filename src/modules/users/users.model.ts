import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Unique,
  AllowNull,
} from 'sequelize-typescript';

import { UserCreationAttributes } from './dto/create.dto';


@Table
export class User extends Model<User, UserCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  firstName: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  lastName: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  email: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  phone: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  password: string;

  @AllowNull(false)
  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  bonuses: number;

  @Column(DataType.STRING)
  resetToken: string | null;

  @Column(DataType.DATE)
  resetTokenExpires: Date | null;
}