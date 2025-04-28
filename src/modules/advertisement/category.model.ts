import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Product } from './advertisement.model';

@Table({
  tableName: 'categories'
})
export class Category extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @HasMany(() => Product)
  products: Product[];
}