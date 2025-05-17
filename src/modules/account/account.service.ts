// src/modules/account/account.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import { User } from '../users/models/users.model';

@Injectable()
export class AccountService {
  constructor(private usersService: UsersService) {}

  /**
   * Отримати дані акаунта для авторизованого користувача
   */
  async getAccount(userId: number): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    // Видаляємо поля з паролем і токенами для безпеки
    const { password, resetToken, resetTokenExpires, ...userData } = user['dataValues'] || user;
    return userData as User;
  }


  async updateAccount(userId: number, updateAccountDto: UpdateAccountDto): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    // Оновити дані користувача
    await user.update(updateAccountDto);


    const { password, resetToken, resetTokenExpires, ...userData } = user['dataValues'] || user;
    return userData as User;
  }


  async checkAuthorization(userId: number): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    return !!user;
  }
}
