//ad-image.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  AllowNull,
  BelongsTo
} from 'sequelize-typescript';
import { Advertisement } from './advertisement.model';

@Table
export class AdImage extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    field: 'image_id'
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
  @Column({
    type: DataType.STRING,
    field: 'image_url'
  })
  imageUrl: string;

  @Column({
    type: DataType.STRING,
    field: 'image_thumbnail_url'
  })
  imageThumbnailUrl: string;

  @Column({
    type: DataType.STRING,
    field: 'image_medium_url'
  })
  imageMediumUrl: string;

  @Column({
    type: DataType.STRING,
    field: 'image_large_url'
  })
  imageLargeUrl: string;

  @Column(DataType.INTEGER)
  width: number;

  @Column(DataType.INTEGER)
  height: number;

  @Column({
    type: DataType.INTEGER,
    field: 'size_kb'
  })
  sizeKb: number;

  @Column({
    type: DataType.INTEGER,
    field: 'display_order',
    defaultValue: 0
  })
  displayOrder: number;

  @Column({
    type: DataType.BOOLEAN,
    field: 'is_main',
    defaultValue: false
  })
  isMain: boolean;

  @BelongsTo(() => Advertisement, 'adId')
  advertisement: Advertisement;
}