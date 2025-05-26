import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminService } from '../admin.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private adminService: AdminService) {
    super({
      usernameField: 'email',
      id : 'id'
    });
  }

  async validate(email: string, password: string, key: string): Promise<any> {
    const user = await this.adminService.validateAdmin(email, password, key);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}