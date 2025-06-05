import { Table, Column, Model, ForeignKey, BelongsTo, CreatedAt, Unique } from 'sequelize-typescript';
import { User } from '../../users/users.model';
import { Advertisement } from '../../advertisement/models/Advertisement.model';

@Table({
  tableName: 'Favorites',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'advertisementId'],
    },
  ],
})
export class Favorite extends Model<Favorite> {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Advertisement)
  @Column
  advertisementId: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Advertisement)
  advertisement: Advertisement;

  @CreatedAt
  declare createdAt: Date;
}
