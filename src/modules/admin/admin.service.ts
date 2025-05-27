import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { AdminLoginDto } from './dto/login.dto';
import { AdminRegisterDto } from './dto/register.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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
    
    console.log(user);

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

    if (!key) {
      throw new BadRequestException('Admin key is required');
    }

    const hashedKey = await bcrypt.hash(key, salt);

    const newAdmin = await this.usersService.createUser({
      ...userDto,
      password: hashedPassword,
      key: hashedKey,
      role: 'ADMIN', // Примусово встановлюємо роль
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
}