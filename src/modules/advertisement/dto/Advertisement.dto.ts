import { IsNotEmpty, IsString, IsNumber, IsEmail, IsEnum, IsOptional, Length, Min, Max, IsArray, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { CategoryEnum, CurrencyEnum } from '../models/Advertisement.model';

export class CreateAdvertisementDto {
  @IsNotEmpty({ message: 'Назва товару не може бути пустою' })
  @IsString()
  @Length(2, 255, { message: 'Назва товару повинна містити від 2 до 255 символів' })
  productName: string;

  @IsNotEmpty({ message: 'Категорія повинна бути обрана' })
  @IsEnum(CategoryEnum, { message: 'Невірна категорія' })
  category: CategoryEnum;

  @IsNotEmpty({ message: 'Опис товару не може бути пустим' })
  @IsString()
  @Length(10, 2000, { message: 'Опис товару повинен містити від 10 до 2000 символів' })
  description: string;

  @IsNotEmpty({ message: 'Ціна не може бути пустою' })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({}, { message: 'Ціна повинна бути числом' })
  @Min(0.01, { message: 'Ціна повинна бути більше 0' })
  @Max(99999999.99, { message: 'Ціна занадто велика' })
  price: number;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsNotEmpty({ message: 'Ім\'я контактної особи не може бути пустим' })
  @IsString()
  @Length(2, 100, { message: 'Ім\'я повинно містити від 2 до 100 символів' })
  contactName: string;

  @IsNotEmpty({ message: 'Email не може бути пустим' })
  @IsEmail({}, { message: 'Невірний формат email' })
  email: string;

  @IsNotEmpty({ message: 'Номер телефону не може бути пустим' })
  @IsString()
  @Matches(/^[\+]?[0-9\s\-\(\)]{10,20}$/, { message: 'Невірний формат номера телефону' })
  phone: string;

  @IsEnum(CurrencyEnum, { message: 'Невірна валюта' })
  currency: CurrencyEnum = CurrencyEnum.UAH;

  @IsNotEmpty({ message: 'Місто не може бути пустим' })
  @IsString()
  @Length(2, 100, { message: 'Назва міста повинна містити від 2 до 100 символів' })
  city: string;

  @IsNotEmpty({ message: 'Регіон не може бути пустим' })
  @IsString()
  @Length(2, 100, { message: 'Назва регіону повинна містити від 2 до 100 символів' })
  region: string;
}