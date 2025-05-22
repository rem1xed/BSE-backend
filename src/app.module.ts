//app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { MailModule } from './modules/mail/mail.module';
import { UsersSettingsModule } from './modules/user-settings/user-settings.module';
import { MeetModule } from './modules/meet/meet.module';
import { AdvertisementModule } from './modules/advertisement/advertisement.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true , envFilePath: '.env'}),
    DatabaseModule,
    UsersModule,
    AdvertisementModule,
    AuthModule,
    ChatModule,
    MailModule,
    UsersSettingsModule,
    MeetModule,
  ]
})
export class AppModule { }
