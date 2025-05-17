//create-advertisement.dto.ts
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

export class AdAttributeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isSearchable?: boolean;

  @IsBoolean()
  @IsOptional()
  isFilterable?: boolean;
}

export class CreateAdImageDto {
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsOptional()
  imageThumbnailUrl?: string;

  @IsString()
  @IsOptional()
  imageMediumUrl?: string;

  @IsString()
  @IsOptional()
  imageLargeUrl?: string;

  @IsInt()
  @IsOptional()
  width?: number;

  @IsInt()
  @IsOptional()
  height?: number;

  @IsInt()
  @IsOptional()
  sizeKb?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isMain?: boolean;
}

export class CreateAdvertisementDto {
  @IsInt()
  @IsNotEmpty()
  subcategoryId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  description: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  priceNegotiable?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string = 'UAH';

  @IsEnum(AdvertisementCondition)
  @IsNotEmpty()
  condition: AdvertisementCondition;

  @IsString()
  @IsNotEmpty()
  location: string;

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
  @IsNotEmpty()
  contactName: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsBoolean()
  @IsOptional()
  hidePhone?: boolean;

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
  images?: CreateAdImageDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdAttributeDto)
  @IsOptional()
  attributes?: AdAttributeDto[];
}