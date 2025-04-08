import { Controller, Get, Param, Post, Body, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserCreationAttributes } from './dto/create.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':email')
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    return user ?? { message: 'User not found' };
  }

  @Post('create')
  async createUser(@Body() body: UserCreationAttributes) {
    const { email, phone, password, firstName, lastName } = body;

    const newUser = await this.usersService.createUser({
      email,
      phone,
      password,
      firstName,
      lastName,
    });

    return newUser;
  }

  @Put('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    const { token, newPassword } = body;
    const result = await this.usersService.resetPassword(token, newPassword);

    if (!result) {
      return { message: 'Invalid or expired token' };
    }

    return { message: 'Password reset successful' };
  }
}
