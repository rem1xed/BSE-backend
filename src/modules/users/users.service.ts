import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './users.model';
import { UserCreationAttributes } from './dto/create.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } }) as Promise<User | null>;
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userModel.findOne({ where: { phone } }) as Promise<User | null>;
  }

  async findById(id: number): Promise<User | null> {
    return this.userModel.findByPk(id) as Promise<User | null>;
  }

  async createUser(createUserDto: UserCreationAttributes): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = await this.userModel.create(createUserDto);

    return user;
  }

  async updateResetToken(email: string, token: string, expires: Date): Promise<void> {
    await this.userModel.update(
      { resetToken: token, resetTokenExpires: expires },
      { where: { email } },
    );
  }

  async resetPassword(token: string, newHashedPassword: string): Promise<boolean> {
    const user = await this.userModel.findOne({ where: { resetToken: token } });

    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      return false;
    }

    user.password = newHashedPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    return true;
  }
}