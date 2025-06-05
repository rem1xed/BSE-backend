import { IsString, IsNotEmpty, IsInt, IsEmpty } from 'class-validator';

export class UserComplaintsDto {
  @IsNotEmpty()
  @IsInt()
  fromUserId: number;

  @IsEmpty({ message: 'fromUser має бути порожнім (заповнюється автоматично)' })
  fromUser?: string;

  @IsNotEmpty()
  @IsInt()
  toUserId: number;

  @IsEmpty({ message: 'toUser має бути порожнім (заповнюється автоматично)' })
  toUser?: string;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsEmpty({ message: 'status має бути порожнім (заповнюється автоматично)' })
  status?: string;
}
