import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { MailService } from '../mail/mail.service';
import { Op } from 'sequelize';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetToken } from './models/reset-token.model';

import { User } from '../users/users.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @Inject('RESET_TOKEN_REPOSITORY')
    private resetTokenRepository: typeof ResetToken,
  ) {}

  async login(user: LoginDto) {

    console.log("Login dto : ", user);

    const email = user.email || user['email'];
    const password = user.password || user['password'];
    const validatedUser = await this.validateUser(email, password);

    if(!validatedUser){
        throw new BadRequestException("Wrong password !");
    }

    const payload = { email: validatedUser.email, sub: validatedUser.id };

    return {
      user : validatedUser,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, password: string): Promise<any> {

    console.log("VALIDATE email: ", email, "password",  password);

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

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new NotFoundException('Користувача з такою електронною поштою не знайдено');
    }

    // Генеруємо випадковий код із 6 цифр
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Встановлюємо термін дії коду (30 хвилин)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // Видаляємо старі токени для цього користувача
    await this.resetTokenRepository.destroy({ where: { email } });

    // Створюємо новий токен скидання пароля
    await this.resetTokenRepository.create({
      email,
      code,
      expiresAt,
    });
    
    // Надсилаємо код на електронну пошту
    await this.mailService.sendPasswordResetCode(email, code);
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto): Promise<boolean> {
    const { email, code } = verifyCodeDto;
    
    const resetToken = await this.resetTokenRepository.findOne({
      where: {
        email,
        code,
        isUsed: false,
        expiresAt: {
          [Op.gt]: new Date(), // Перевіряємо, що термін дії не закінчився
        },
      },
    });

    if (!resetToken) {
      throw new BadRequestException('Недійсний або прострочений код');
    }

    
    return true;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { email, code, newPassword } = resetPasswordDto;
    
    // Перевіряємо, чи існує такий код скидання
    const resetToken = await this.resetTokenRepository.findOne({
      where: {
        email,
        code,
        isUsed: false,
        expiresAt: {
          [Op.gt]: new Date(), // Перевіряємо, що термін дії не закінчився
        },
      },
    });

    if (!resetToken) {
      throw new BadRequestException('Недійсний або прострочений код');
    }

    // Оновлюємо пароль користувача
    await this.usersService.updatePassword(email, newPassword);
    
    // Позначаємо токен як використаний
    resetToken.isUsed = true;
    await resetToken.save();
  }
}