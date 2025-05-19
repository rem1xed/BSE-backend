import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Unique,
  AllowNull,
  HasMany,
  BelongsToMany
} from 'sequelize-typescript';
import { UserCreationAttributes } from '../dto/register.dto';
import { UserLike } from '../../advertisement/models/user-like.model';
import { Advertisement } from 'src/modules/advertisement/models/advertisement.model';

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
  
  @HasMany(() => Advertisement, {
  foreignKey: 'authorId',
  as: 'authoredAdvertisements' // <-- unique alias
})
authoredAdvertisements: Advertisement[];
  @BelongsToMany(() => Advertisement, () => UserLike)
  likedAdvertisements: Advertisement[];
}