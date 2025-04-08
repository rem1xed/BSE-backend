import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../modules/users/users.model';
import { SynchronizeService } from '../database/synchronize.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT') || '5432', 10),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        models: [User],
        autoLoadModels: true,
        synchronize: true,
        logging: console.log,  // Додаємо виведення в консоль
      }),
    }),    
  ],
  providers: [SynchronizeService],
})
export class DatabaseModule {}