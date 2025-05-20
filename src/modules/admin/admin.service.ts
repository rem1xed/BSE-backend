import { Injectable, UnauthorizedException, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/models/users.model';
import { Advertisement } from '../advertisement/models/advertisement.model';
import { Chat } from '../chat/models/chat.model';
import { Message } from '../chat/message/message.model';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AdminLoginDto } from './dto/admin-login.dto';
import { Admin } from './admin.model';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Advertisement)
    private advertisementModel: typeof Advertisement,
    @InjectModel(Chat)
    private chatModel: typeof Chat,
    @InjectModel(Message)
    private messageModel: typeof Message,
    @InjectModel(Admin)
    private adminModel: typeof Admin,
    private configService: ConfigService,
  ) { }

  private get adminAccessKey(): string {
    return this.configService.get<string>('ADMIN_SECRET_KEY') || 'ultrathink';
  }

  async validateAdminLogin(loginDto: AdminLoginDto): Promise<{ token: string }> {
    try {
      // Check if secret key is valid
      if (loginDto.secretKey !== this.adminAccessKey) {
        throw new UnauthorizedException('Invalid access key');
      }

      // Find admin user
      const admin = await this.adminModel.findOne({ where: { email: loginDto.email } });

      // If no admin found, check if this is a user with admin privileges
      if (!admin) {
        const user = await this.userModel.findOne({ where: { email: loginDto.email } });
        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        const passwordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!passwordValid) {
          throw new UnauthorizedException('Invalid password');
        }

        // Check if user has admin role
        if (user.role !== 'admin') {
          throw new ForbiddenException('User does not have admin privileges');
        }

        const token = jwt.sign(
          { userId: user.id, email: user.email, role: 'admin' },
          this.configService.get<string>('JWT_SECRET') || 'default_secret_key',
          { expiresIn: '8h' },
        );

        return { token };
      }

      // Admin user found, validate password
      const passwordValid = await bcrypt.compare(loginDto.password, admin.password);
      if (!passwordValid) {
        throw new UnauthorizedException('Invalid password');
      }

      const token = jwt.sign(
        { adminId: admin.id, email: admin.email, role: 'admin' },
        this.configService.get<string>('JWT_SECRET') || 'default_secret_key',
        { expiresIn: '8h' },
      );

      return { token };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Admin login error:', error);
      throw new InternalServerErrorException('An error occurred during login');
    }
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.findAll({
      attributes: { exclude: ['password'] }, // Don't return passwords
    });
  }

  async getAllAdvertisements(): Promise<Advertisement[]> {
    return this.advertisementModel.findAll({
      include: [{ model: User, attributes: ['id', 'email', 'username'] }],
    });
  }

  async getAdminDashboardStats() {
    const usersCount = await this.userModel.count();
    const activeAdsCount = await this.advertisementModel.count({ where: { isActive: true } });
    const totalAdsCount = await this.advertisementModel.count();
    const totalChatsCount = await this.chatModel.count();

    // Get latest 5 users
    const latestUsers = await this.userModel.findAll({
      attributes: ['id', 'email', 'username', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    // Get latest 5 ads
    const latestAds = await this.advertisementModel.findAll({
      include: [{ model: User, attributes: ['id', 'username'] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    return {
      stats: {
        usersCount,
        activeAdsCount,
        totalAdsCount,
        totalChatsCount,
      },
      latestUsers,
      latestAds,
    };
  }

  async getAllChats() {
    return this.chatModel.findAll({
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'email'] },
        {
          model: Message,
          limit: 1,
          order: [['createdAt', 'DESC']],
          attributes: ['content', 'createdAt']
        },
      ],
    });
  }

  async getChatMessages(chatId: number) {
    const chat = await this.chatModel.findByPk(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return this.messageModel.findAll({
      where: { chatId },
      order: [['createdAt', 'ASC']],
      include: [{ model: User, attributes: ['id', 'username'] }],
    });
  }

  async banUser(userId: number) {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isBanned = true;
    await user.save();
    return { message: 'User banned successfully' };
  }

  async unbanUser(userId: number) {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isBanned = false;
    await user.save();
    return { message: 'User unbanned successfully' };
  }

  async deleteAdvertisement(adId: number) {
    const ad = await this.advertisementModel.findByPk(adId);
    if (!ad) {
      throw new NotFoundException('Advertisement not found');
    }

    await ad.destroy();
    return { message: 'Advertisement deleted successfully' };
  }

  async toggleAdActiveStatus(adId: number) {
    const ad = await this.advertisementModel.findByPk(adId);
    if (!ad) {
      throw new NotFoundException('Advertisement not found');
    }

    ad.isActive = !ad.isActive;
    await ad.save();
    return {
      message: ad.isActive ? 'Advertisement activated' : 'Advertisement deactivated',
      isActive: ad.isActive
    };
  }

  async createAdminUser(email: string, password: string, secretKey: string) {
    try {
      // Check if admin with this email already exists
      const existingAdmin = await this.adminModel.findOne({ where: { email } });
      if (existingAdmin) {
        throw new ForbiddenException('Admin with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new admin
      const admin = await this.adminModel.create({
        email,
        password: hashedPassword,
        secretKey,
      });

      return {
        id: admin.id,
        email: admin.email,
        message: 'Admin user created successfully',
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Create admin error:', error);
      throw new InternalServerErrorException('An error occurred while creating admin user');
    }
  }
}
