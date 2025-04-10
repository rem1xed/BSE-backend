import { Injectable, UnauthorizedException, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { LoginDto } from 'src/modules/users/dto/dto.login';


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
  @Post('login')
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };

    return {
      user,
      accessToken: this.jwtService.sign(payload),
    };
  }


  }
