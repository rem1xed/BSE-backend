import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { AdminService } from 'src/modules/admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const adminService = app.get(AdminService);
    const result = await adminService.createAdminUser(
      'admin@example.com',
      'secure_password',
      'ultrathink'
    );

    console.log('Admin created successfully:', result);
  } catch (error) {
    console.error('Failed to create admin:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
