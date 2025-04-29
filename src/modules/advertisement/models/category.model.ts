//src\modules\advertisement\models\category.model.ts

import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Product } from './advertisement.model';

interface CategoryCreationAttributes {
  name: string;
}

@Table({
  tableName: 'categories'
})
export class Category extends Model<Category, CategoryCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

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