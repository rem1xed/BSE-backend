import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
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

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
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

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetToken = null;
    await user.save();
  }
}
