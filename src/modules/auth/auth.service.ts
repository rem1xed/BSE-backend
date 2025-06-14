import { Injectable, BadRequestException, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { MailService } from '../mail/mail.service';
import { Op } from 'sequelize';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetToken } from './models/reset-token.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @Inject('RESET_TOKEN_REPOSITORY')
    private resetTokenRepository: typeof ResetToken,
  ) {}

  //USERS METHODS

  async login(user: LoginDto) {
    console.log("Login dto : ", user);

    const email = user.email || user['email'];
    const password = user.password || user['password'];
    const validatedUser = await this.validateUser(email, password);

    if(!validatedUser){
        throw new BadRequestException("Wrong password !");
    }

    // Create payload matching the structure in JwtStrategy's validate method
    const payload = { 
      sub: validatedUser.id, 
      email: validatedUser.email,
      firstName: validatedUser.firstName, 
      lastName: validatedUser.lastName,
      phone: validatedUser.phone, 
    };

    return {
      user: validatedUser,
      auth_token: this.jwtService.sign(payload),
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

    if (userDto.password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingEmail = await this.usersService.findByEmail(userDto.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingPhone = await this.usersService.findByPhone(userDto.phone);
    if (existingPhone) {
      throw new ConflictException('Phone number already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userDto.password, salt);

    const newUser = await this.usersService.createUser({
      ...userDto,
      password: hashedPassword,
      role: 'USER', // Примусово встановлюємо роль
      key: undefined
    });

    const { password, ...result } = newUser.toJSON();

    const payload = {
      sub: result.id,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      phone: result.phone,
    };

    return {
      user: result,
      auth_token: this.jwtService.sign(payload),
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

  logout(res: Response) {
    res.clearCookie('auth_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return { message: 'Logged out successfully' };
  }
}