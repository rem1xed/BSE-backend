//src\modules\advertisement\advertisement.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ProductsService } from './advertisement.service';
import { Product } from './models/advertisement.model';
import { Category } from './models/category.model';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: typeof Product;
  let categoryModel: typeof Category;

  const mockProductModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  };

  const mockCategoryModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  };

  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 9.99,
    sku: 'TEST-123',
    quantity: 10,
    categoryId: 1,
    update: jest.fn(),
    destroy: jest.fn(),
  };

  const mockCategory = {
    id: 1,
    name: 'Test Category',
    description: 'Test Category Description',
    update: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product),
          useValue: mockProductModel,
        },
        {
          provide: getModelToken(Category),
          useValue: mockCategoryModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productModel = module.get<typeof Product>(getModelToken(Product));
    categoryModel = module.get<typeof Category>(getModelToken(Category));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const createProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 9.99,
        sku: 'TEST-123',
        quantity: 10,
        categoryId: 1,
      };

      mockCategoryModel.findByPk.mockResolvedValue(mockCategory);
      mockProductModel.create.mockResolvedValue(mockProduct);

      const result = await service.createProduct(createProductDto);

      expect(mockCategoryModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockProductModel.create).toHaveBeenCalledWith({
        name: 'Test Product',
        description: 'Test Description',
        price: 9.99,
        sku: 'TEST-123',
        quantity: 10,
        categoryId: 1,
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if category not found', async () => {
      const createProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 9.99,
        sku: 'TEST-123',
        quantity: 10,
        categoryId: 999,
      };

      mockCategoryModel.findByPk.mockResolvedValue(null);

      await expect(service.createProduct(createProductDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCategoryModel.findByPk).toHaveBeenCalledWith(999);
    });
  });

  describe('findAllProducts', () => {
    it('should return all products', async () => {
      const mockProducts = [mockProduct];
      mockProductModel.findAll.mockResolvedValue(mockProducts);

      const result = await service.findAllProducts();

      expect(mockProductModel.findAll).toHaveBeenCalledWith({
        include: [{ model: Category }],
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findProductById', () => {
    it('should find and return a product by id', async () => {
      mockProductModel.findByPk.mockResolvedValue(mockProduct);

      const result = await service.findProductById(1);

      expect(mockProductModel.findByPk).toHaveBeenCalledWith(1, {
        include: [{ model: Category }],
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductModel.findByPk.mockResolvedValue(null);

      await expect(service.findProductById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // Add more tests for other methods as needed
});