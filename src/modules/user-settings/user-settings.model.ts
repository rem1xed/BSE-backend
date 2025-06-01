import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.model';
import { SettingsDto } from './dto/settings.dto';
import { IsOptional } from 'class-validator';

@Table({ tableName: 'UserSettings' })
export class UserSettings extends Model<UserSettings, SettingsDto> {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  userId: number;

  @IsOptional()
  @Column(DataType.STRING)
  age: string;

  @IsOptional()
  @Column(DataType.STRING)
  country: string;

  @IsOptional()
  @Column(DataType.STRING)
  region: string;

  @IsOptional()
  @Column(DataType.STRING)
  city: string;

  @IsOptional()
  @Column(DataType.ARRAY(DataType.STRING))
  interests: string[];

  @IsOptional()
  @Column(DataType.STRING)
  profession: string;

  @IsOptional()
  @Column(DataType.STRING)
  industry: string;

  @IsOptional()
  @Column(DataType.STRING)
  educationLevel: string;

  @IsOptional()
  @Column(DataType.STRING)
  educationInstitution: string;

  @IsOptional()
  @Column(DataType.STRING)
  socialNetwork: string;

  @IsOptional()
  @Column(DataType.STRING)
  instagramLink: string;

  @IsOptional()
  @Column(DataType.STRING)
  facebookLink: string;
}
