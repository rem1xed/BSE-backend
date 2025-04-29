
//src\modules\advertisement\advertisement.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from './models/advertisement.model';
import { Category } from './models/category.model';

import { CreateProductDto, 
        UpdateProductDto } 
from './dto/advertisement.dto';

import { CreateCategoryDto, 
        UpdateCategoryDto } 
from './dto/category.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    private productModel: typeof Product,
    @InjectModel(Category)
    private categoryModel: typeof Category,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryId, ...rest } = createProductDto;
    const category = await this.categoryModel.findByPk(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.productModel.create({
      ...rest,
      categoryId
    });
  }

  async findAllProducts(): Promise<Product[]> {
    return this.productModel.findAll({
      include: [{ model: Category }]
    });
  }

  async findProductById(id: number): Promise<Product> {
    const product = await this.productModel.findByPk(id, {
      include: [{ model: Category }]
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async updateProduct(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findProductById(id);
    
    // Update the product properties
    await product.update(updateProductDto);
    
    return this.findProductById(id); // Fetch fresh instance with relations
  }

  async removeProduct(id: number): Promise<void> {
    const product = await this.findProductById(id);
    await product.destroy();
  }

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryModel.create(createCategoryDto);
  }

  async findAllCategories(): Promise<Category[]> {
    return this.categoryModel.findAll({
      include: [{ model: Product }]
    });
  }

  async findCategoryById(id: number): Promise<Category> {
    const category = await this.categoryModel.findByPk(id, {
      include: [{ model: Product }]
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findCategoryById(id);
    
    // Update the category properties
    await category.update(updateCategoryDto);
    
    return this.findCategoryById(id); // Fetch fresh instance with relations
  }

  async removeCategory(id: number): Promise<void> {
    const category = await this.findCategoryById(id);
    await category.destroy();
  }
}