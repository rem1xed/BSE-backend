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

import { UserCreationAttributes } from './dto/register.dto';

@Table
export class User extends Model<User, UserCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column( {
    type: DataType.STRING,
    field: 'firstName'
  })
  declare firstName: string;

  @AllowNull(false)
  @Column( {
    type: DataType.STRING,
    field: 'lastName'
  })
  declare lastName: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  declare email: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  declare phone: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare password: string;

  @AllowNull(false)
  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  declare bonuses: number;

  @Column(DataType.STRING)
  declare resetToken: string | null;

  @Column(DataType.DATE)
  declare resetTokenExpires: Date | null;
}
