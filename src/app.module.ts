//app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { MailModule } from './modules/mail/mail.module';
import { AdvertisementModule } from './modules/advertisement/advertisement.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true , envFilePath: '.env'}),
    DatabaseModule,
    UsersModule,
    AdvertisementModule,
    AuthModule,
    ChatModule,
    MailModule,
    AdminModule
  ],
})
export class AppModule { }
