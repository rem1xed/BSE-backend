//advertisement.model

import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany,
  BelongsToMany,
  Default,
  AllowNull
} from 'sequelize-typescript';

import { Subcategory } from './subcategory.model';
import { AdImage } from './ad-image.model';
import { UserLike } from './user-like.model';
import { User } from 'src/modules/users/models/users.model';
import { AdAttribute } from './ad-attribute.model';
import { InferAttributes, InferCreationAttributes } from 'sequelize';

@Table
export class Advertisement extends Model<
  InferAttributes<Advertisement>,
  InferCreationAttributes<Advertisement>
> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    field: 'ad_id'
  })
  declare id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    field: 'author_id'
  })
  authorId: number;

  @ForeignKey(() => Subcategory)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    field: 'subcategory_id'
  })
  subcategoryId: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  title: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.DECIMAL(10, 2))
  price: number;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'price_negotiable'
  })
  priceNegotiable: boolean;

  @Default('UAH')
  @Column(DataType.STRING)
  currency: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  condition: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  location: string;

  @AllowNull(true) // Updated to allow null
  @Column({
    type: DataType.STRING,
    field: 'district'
  })
  district: string | null; // Updated type to include null

  @AllowNull(true) // Updated to allow null
  @Column({
    type: DataType.STRING,
    field: 'postal_code'
  })
  postalCode: string | null; // Updated type to include null

  @AllowNull(true) // Updated to allow null
  @Column({
    type: DataType.TEXT,
    field: 'delivery_options'
  })
  deliveryOptions: string | null; // Updated type to include null

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'exchange_possible'
  })
  exchangePossible: boolean;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'contact_name'
  })
  contactName: string;

  @AllowNull(true) // Updated to allow null
  @Column({
    type: DataType.STRING,
    field: 'contact_phone'
  })
  contactPhone: string | null; // Updated type to include null

  @AllowNull(true) // Updated to allow null
  @Column({
    type: DataType.STRING,
    field: 'contact_email'
  })
  contactEmail: string | null; // Updated type to include null

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'hide_phone'
  })
  hidePhone: boolean;

  @Default('active')
  @Column(DataType.STRING)
  status: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_premium'
  })
  isPremium: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_urgent'
  })
  isUrgent: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_highlighted'
  })
  isHighlighted: boolean;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    field: 'views_count'
  })
  viewsCount: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    field: 'phone_shows_count'
  })
  phoneShowsCount: number;

  @Column({
    type: DataType.DATE,
    field: 'bump_date'
  })
  bumpDate: Date;

  @Column({
    type: DataType.DATE,
    field: 'expiration_date'
  })
  expirationDate: Date;

  @BelongsTo(() => Subcategory, 'subcategoryId')
  subcategory: Subcategory;

  @HasMany(() => AdImage)
  images: AdImage[];

  @BelongsTo(() => User, 'authorId')
  author: User;

  @BelongsToMany(() => User, () => UserLike, 'adId', 'userId')
  likedByUsers: User[];

  @HasMany(() => AdAttribute)
  attributes: AdAttribute[];
}