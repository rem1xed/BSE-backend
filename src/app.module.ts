import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { MailModule } from './modules/mail/mail.module';
import { UsersSettingsModule } from './modules/user-settings/user-settings.module';
import { MeetModule } from './modules/meet/meet.module';
import { AdminModule } from './modules/admin/admin.module';
import { AdvertisementModule } from './modules/advertisement/advertisement.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { UsersComplaintsModule } from './modules/UserComplaints/UserComplaints.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    AdminModule,
    ChatModule,
    MailModule,
    UsersSettingsModule,
    MeetModule,
    AdvertisementModule,
    FavoritesModule,
    UsersComplaintsModule
  ]
})
export class AppModule {}
