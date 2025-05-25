import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
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
import { AdminLoginDto } from './dto/adminLogin.dto';
import { AdminRegisterDto } from './dto/adminRegister.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @Inject('RESET_TOKEN_REPOSITORY')
    private resetTokenRepository: typeof ResetToken,
  ) {}

  // ADMIN METHODS

  async adminLogin(user: AdminLoginDto) {
    console.log("Login dto : ", user);

    const email = user.email || user['email'];
    const password = user.password || user['password'];
    const key = user.key || user['key'];
    const validatedAdmin = await this.validateAdmin(email, password, key);

    if(!validatedAdmin){
        throw new BadRequestException("Wrong password !");
    }

    const payload = { 
      sub: validatedAdmin.id, 
      email: validatedAdmin.email,
      firstName: validatedAdmin.firstName, 
      lastName: validatedAdmin.lastName,
      phone: validatedAdmin.phone, 
    };

    return {
      user: validatedAdmin,
      auth_admin_token: this.jwtService.sign(payload),
    };
  }

  async validateAdmin(email: string, password: string, key: string): Promise<any> {
    console.log("VALIDATE email: ", email, "password",  password);

    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }

    if (user.role !== "ADMIN"){
      return null;
    }
    
    if (!user.password) {
      console.log('Користувач знайдений, але пароль відсутній:', user.email);
      return null; // або throw new Error('User has no password set');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    const isKeyValid = await bcrypt.compare(key, user.key);
    
    if (isPasswordValid && isKeyValid) {
      const { password, resetToken, resetTokenExpires, ...result } = user.toJSON();
      return result;
    }
    
    return null;
  }

  async registerAdmin(adminDto: AdminRegisterDto) {
    const { confirmPassword, key, ...userDto } = adminDto;

    if (userDto.password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingEmail = await this.usersService.findByEmail(userDto.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userDto.password, salt);

    let hashedKey: string | undefined;
    if (userDto.role === 'ADMIN') {
      if (!key) {
        throw new BadRequestException('Admin key is required');
      }
      hashedKey = await bcrypt.hash(key, salt);
    }

    const newAdmin = await this.usersService.createUser({
      ...userDto,
      password: hashedPassword,
      role: 'ADMIN',
      ...(hashedKey ? { key: hashedKey } : {}), // ← умовно додаємо
    });

    const { password, key: _, ...result } = newAdmin.toJSON();

    const payload = {
      sub: result.id,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      phone: result.phone,
    };

    return {
      user: result,
      auth_admin_token: this.jwtService.sign(payload),
    };
  }


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
    
    // Генеруємо JWT з повним набором даних
    const payload = { 
      sub: result.id, 
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      phone: result.phone
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