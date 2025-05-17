import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Subcategory } from '../../modules/advertisement/models/subcategory.model';

@Injectable()
export class SubcategorySeeder {
  constructor(
    @InjectModel(Subcategory)
    private subcategoryModel: typeof Subcategory,
  ) {}

  async seed() {
    const subcategories = [
      // Electronics (categoryId: 1)
      { name: 'Smartphones', categoryId: 1 },
      { name: 'Laptops', categoryId: 1 },
      { name: 'Tablets', categoryId: 1 },
      { name: 'Desktop Computers', categoryId: 1 },

      // Vehicles (categoryId: 2)
      { name: 'Cars', categoryId: 2 },
      { name: 'Motorcycles', categoryId: 2 },
      { name: 'Trucks', categoryId: 2 },
      { name: 'Auto Parts', categoryId: 2 },

      // Home & Garden (categoryId: 3)
      { name: 'Furniture', categoryId: 3 },
      { name: 'Garden Tools', categoryId: 3 },
      { name: 'Home Decor', categoryId: 3 }
    ];

    try {
      await this.subcategoryModel.destroy({
        truncate: true,
        cascade: true,
        force: true
      });

      const created = await this.subcategoryModel.bulkCreate(subcategories, {
        fields: ['name', 'categoryId'],
        returning: true
      });

      console.log(`Seeded ${created.length} subcategories`);
      return created;
    } catch (error) {
      console.error('Error seeding subcategories:', error);
      throw error;
    }
  }
}