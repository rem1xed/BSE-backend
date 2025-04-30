import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../modules/users/users.model';
import { ResetToken } from 'src/modules/auth/models/reset-token.model';

@Module({
  imports: [
    ConfigModule, // потрібно для передачі в useFactory
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        models: [User, ResetToken],
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
