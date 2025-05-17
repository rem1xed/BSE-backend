//advertisement-query.dto

import { IsOptional, IsInt, IsString, Min, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

// Define possible status values for advertisements
export enum AdvertisementStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  EXPIRED = 'expired',
  DELETED = 'deleted',
}

export class AdvertisementQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  subcategoryId?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  authorId?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPremium?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isUrgent?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  exchangePossible?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortDirection?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  attributes?: string;
  
  @IsOptional()
  @IsEnum(AdvertisementStatus)
  status?: AdvertisementStatus = AdvertisementStatus.ACTIVE;
}