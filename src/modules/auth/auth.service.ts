import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Op } from 'sequelize';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetToken } from './models/reset-token.model';
<<<<<<< HEAD
import { User } from '../users/models/users.model';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
=======
>>>>>>> a85bcd8ab504fc85bc59dfb2cb34f2cd2faaf684

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly emailService: MailService,
    @Inject('RESET_TOKEN_REPOSITORY')
    private resetTokenRepository: typeof ResetToken,
  ) {}

  async login(user: LoginDto) {
    console.log("Login dto : ", user);

    const email = user.email || user['email'];
    const password = user.password || user['password'];
    const validatedUser = await this.validateUser(email, password);

    if (!validatedUser) {
      throw new BadRequestException("Wrong password !");
    }

    const payload = { email: validatedUser.email, sub: validatedUser.id };

    return {
      user: validatedUser,
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
    console.log("VALIDATE email: ", email, "password", password);

    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    const { password: _, resetToken, resetTokenExpires, ...result } = user.toJSON();
    return result;
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
    });

    const { password, ...result } = newUser.toJSON();
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
          [Op.gt]: new Date(),
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

    const resetToken = await this.resetTokenRepository.findOne({
      where: {
        email,
        code,
        isUsed: false,
        expiresAt: {
          [Op.gt]: new Date(),
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
