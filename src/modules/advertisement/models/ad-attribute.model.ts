//ad-attribute.model.ts

import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  Default,
  AllowNull,
  BelongsTo
} from 'sequelize-typescript';
import { Advertisement } from './advertisement.model';

@Table
export class AdAttribute extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    field: 'attribute_id'
  })
  declare id: number;

  @ForeignKey(() => Advertisement)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    field: 'ad_id'
  })
  adId: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  value: string;

  @Column(DataType.STRING)
  unit: string;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    field: 'display_order'
  })
  displayOrder: number;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_searchable'
  })
  isSearchable: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_filterable'
  })
  isFilterable: boolean;

 
  @BelongsTo(() => Advertisement, 'adId')
  advertisement: Advertisement;
  
}