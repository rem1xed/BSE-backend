// src/modules/account/dto/update-account.dto.ts
import { IsEmail, IsString, IsOptional, Length, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiProperty({ description: "Ім'я користувача", example: "Іван", required: false })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  readonly firstName?: string;

  @ApiProperty({ description: "Прізвище користувача", example: "Петренко", required: false })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  readonly lastName?: string;

  @ApiProperty({ description: "Email користувача", example: "user@example.com", required: false })
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiProperty({ description: "Номер телефону", example: "+380991234567", required: false })
  @IsOptional()
  @IsPhoneNumber()
  readonly phone?: string;

  @ApiProperty({ description: "Адреса користувача", example: "м. Київ, вул. Хрещатик, 1", required: false })
  @IsOptional()
  @IsString()
  readonly address?: string;
}
