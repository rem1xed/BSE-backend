import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (isPasswordValid) {
      const { password, resetToken, resetTokenExpires, ...result } = user.toJSON();
      return result;
    }
    
    return null;
  }

  async register(registerDto: RegisterDto) {
    const { confirmPassword, ...userDto } = registerDto;
    
    // Перевірка чи паролі співпадають
    if (userDto.password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    
    // Перевірка на існуючий email
    const existingEmail = await this.usersService.findByEmail(userDto.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }
    
    // Перевірка на існуючий телефон
    const existingPhone = await this.usersService.findByPhone(userDto.phone);
    if (existingPhone) {
      throw new ConflictException('Phone number already exists');
    }
    
    // Хешування пароля
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userDto.password, salt);
    
    // Створення користувача
    const newUser = await this.usersService.createUser({
      ...userDto,
      password: hashedPassword,
    });
    
    // Видаляємо пароль з відповіді
    const { password, ...result } = newUser.toJSON();
    
    // Генеруємо JWT
    const payload = { email: result.email, sub: result.id };
    
    return {
      user: result,
      accessToken: this.jwtService.sign(payload),
    };
  }
}