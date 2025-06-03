import { IsOptional, IsString, IsArray } from 'class-validator';

export class SettingsDto {
  @IsOptional()
  @IsString()
  age?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @IsString()
  profession?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  educationLevel?: string;

  @IsOptional()
  @IsString()
  educationInstitution?: string;

  @IsOptional()
  @IsString()
  socialNetwork?: string;

  @IsOptional()
  @IsString()
  instagramLink?: string;

  @IsOptional()
  @IsString()
  facebookLink?: string;
}