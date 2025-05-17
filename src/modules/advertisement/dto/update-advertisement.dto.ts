//update-advertisement.dto.ts

import { Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEmail,
  IsDate,
  IsEnum,
  MaxLength,
  MinLength,
  ValidateNested,
  IsArray,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { AdAttributeDto, CreateAdImageDto } from './create-advertisement.dto';

enum AdvertisementStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SOLD = 'sold',
  DELETED = 'deleted'
}

enum AdvertisementCondition {
  NEW = 'new',
  USED = 'used',
  REFURBISHED = 'refurbished'
}

export class UpdateAdvertisementDto {
  @IsInt()
  @IsOptional()
  subcategoryId?: number;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(20)
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  priceNegotiable?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string;

  @IsEnum(AdvertisementCondition)
  @IsOptional()
  condition?: AdvertisementCondition;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @IsString()
  @IsOptional()
  deliveryOptions?: string;

  @IsBoolean()
  @IsOptional()
  exchangePossible?: boolean;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsBoolean()
  @IsOptional()
  hidePhone?: boolean;

  @IsEnum(AdvertisementStatus)
  @IsOptional()
  status?: AdvertisementStatus;

  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

  @IsBoolean()
  @IsOptional()
  isUrgent?: boolean;

  @IsBoolean()
  @IsOptional()
  isHighlighted?: boolean;

  @IsDate()
  @IsOptional()
  expirationDate?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAdImageDto)
  @IsOptional()
  imagesToAdd?: CreateAdImageDto[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  imagesToRemove?: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdAttributeDto)
  @IsOptional()
  attributesToAdd?: AdAttributeDto[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  attributesToRemove?: number[];
}