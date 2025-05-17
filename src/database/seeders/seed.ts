import { NestFactory } from '@nestjs/core';
import { SeederModule } from './subcategory.seeders.module';
import { SubcategorySeeder } from './subcategory.seeders';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeederModule);
  const seeder = appContext.get(SubcategorySeeder);
  
  try {
    await seeder.seed();
    console.log('Seeding completed');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    await appContext.close();
  }
}

bootstrap();