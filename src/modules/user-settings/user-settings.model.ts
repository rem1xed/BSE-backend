import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/models/users.model';
import { SettingsDto } from './dto/settings.dto';

@Table({ tableName: 'UserSettings' })
export class UserSettings extends Model<UserSettings, SettingsDto> {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  userId: number;

  @Column(DataType.STRING)
  age: string;

  @Column(DataType.STRING)
  country: string;

  @Column(DataType.STRING)
  region: string;

  @Column(DataType.STRING)
  city: string;

  @Column(DataType.ARRAY(DataType.STRING))
  interests: string[];

  @Column(DataType.STRING)
  profession: string;

  @Column(DataType.STRING)
  industry: string;

  @Column(DataType.STRING)
  educationLevel: string;

  @Column(DataType.STRING)
  educationInstitution: string;

  @Column(DataType.STRING)
  socialNetwork: string;

  @Column(DataType.STRING)
  instagramLink: string;

  @Column(DataType.STRING)
  facebookLink: string;
}
