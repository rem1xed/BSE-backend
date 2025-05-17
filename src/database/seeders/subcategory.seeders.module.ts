import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SubcategorySeeder } from './subcategory.seeders';
import { Subcategory } from '../../modules/advertisement/models/subcategory.model';
import { DatabaseModule } from '../database.module';

@Module({
  imports: [
    DatabaseModule,
    SequelizeModule.forFeature([Subcategory]) // Fix: Import Subcategory model, not the seeder
  ],
  providers: [SubcategorySeeder],
  exports: [SubcategorySeeder],
})
export class SeederModule {}