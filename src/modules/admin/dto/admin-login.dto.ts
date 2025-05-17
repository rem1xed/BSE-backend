import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AdminLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  secretKey: string;
}
