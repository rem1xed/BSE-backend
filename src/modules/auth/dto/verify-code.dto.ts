import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class VerifyCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}