import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
  
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUserById(id: number) {
    const user = await this.usersService.findById(id);
    if (!user) return null;

    const { password, resetToken, resetTokenExpires, ...userData } = user.get({ plain: true });
    return userData;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }
    

    if (!user.password) {
      console.log('Користувач знайдений, але пароль відсутній:', user.email);
      return null; // або throw new Error('User has no password set');
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

  async forgotPassword(email: string): Promise<void> {
    console.log('[DEBUG] Forgot password triggered for:', email);
    
    const user = await this.usersService.findByEmail(email);
    console.log('[DEBUG] User found:', user);


    if (!user) {
        throw new NotFoundException(`No user found for email: ${email}`);
    }
    await this.emailService.sendResetPasswordLink(email);
}

  async resetPassword(token: string, password: string): Promise<void> {
    
    const email = await this.emailService.decodeConfirmationToken(token);

    const user = await this.usersService.findByEmail(email);
    if (!user) {
        throw new NotFoundException(`No user found for email: ${email}`);
    }

    user.password = password;
   
    user.resetToken = null;
    await user.save();
} 
}