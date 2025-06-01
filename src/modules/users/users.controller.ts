import { Controller, Get, Param, Post, Body, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserCreationAttributes } from './dto/register.dto';
import { AdvertisementService } from '../advertisement/advertisement.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly advertisementService: AdvertisementService
  ) {}

  // @Get(':email')
  // async getUserByEmail(@Param('email') email: string) {
  //   const user = await this.usersService.findByEmail(email);
  //   return user ?? { message: 'User not found' };
  // }

  @Post('create')
  async createUser(@Body() body: UserCreationAttributes) {
    const { email, phone, password, firstName, lastName } = body;

    const newUser = await this.usersService.createUser({
      firstName,
      lastName,
      email,
      phone,
      password,
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

  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    const user = await this.usersService.findById(Number(id));
    if (!user || user.role === "ADMIN") {
      return null;
    }

    const advertisements = await this.advertisementService.findAll();

    const clearAdvertisements = advertisements.map(ad => {
      const { author, ...rest } = ad.get({ plain: true });
      return rest;
    });

    const response = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      userAdvertisements: clearAdvertisements,
    };

    return response;
  }

}
