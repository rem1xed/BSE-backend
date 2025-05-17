//subcategory.model.ts

import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  HasMany
} from 'sequelize-typescript';
import { Advertisement } from './advertisement.model';

// This is a simplified model for the Subcategory
// You may need to extend it based on your actual schema

@Table
export class Subcategory extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    field: 'subcategory_id'
  })
  declare id: number;

  @Column(({
    type: DataType.STRING,
    allowNull: false // Make name required
  }))
  name: string;

  @Column({
    type: DataType.INTEGER,
    field: 'category_id'
  })
  categoryId: number;

  @HasMany(() => Advertisement)
  advertisements: Advertisement[];
  
}