import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  HasMany,
  CreatedAt,
  UpdatedAt
} from 'sequelize-typescript';
import { Advertisement } from './advertisement.model';

@Table({
  tableName: 'Subcategory',
  timestamps: true
})
export class Subcategory extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    field: 'subcategory_id'
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name: string;

  @Column({
    type: DataType.INTEGER,
    field: 'category_id',
    allowNull: false
  })
  categoryId: number;

  @CreatedAt
  @Column
  declare createdAt: Date;

  @UpdatedAt
  @Column
  declare updatedAt: Date;

  @HasMany(() => Advertisement, {
  foreignKey: 'subcategoryId',
  as: 'subcategoryAdvertisements' // <-- unique alias
  })
  subcategoryAdvertisements: Advertisement[];
}