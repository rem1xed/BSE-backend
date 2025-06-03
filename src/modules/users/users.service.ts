import { Injectable, Inject } from '@nestjs/common';
import { User } from './users.model';
import { UserCreationAttributes } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';  // Змінено з bcrypt на bcryptjs

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: typeof User,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phone } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findByPk(id);
  }

  async createUser(createUserDto: UserCreationAttributes): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = await this.userRepository.create({
      ...createUserDto,
    });

    return user;
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(updateData, { where: { id } });
    return this.findById(id);
  }

  async updateResetToken(email: string, token: string, expires: Date): Promise<void> {
    await this.userRepository.update(
      { resetToken: token, resetTokenExpires: expires },
      { where: { email } },
    );
  }

  async resetPassword(token: string, newHashedPassword: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { resetToken: token } });

    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      return false;
    }

    user.password = newHashedPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    return true;
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(
      { password: hashedPassword },
      { where: { email } }
    );
  }

  async getAll(){
    return await this.userRepository.findAll({where:{role: 'USER'}});
  }
}