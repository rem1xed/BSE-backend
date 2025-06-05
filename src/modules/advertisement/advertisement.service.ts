// advertisement.service.ts
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Advertisement } from './models/Advertisement.model';
import { CreateAdvertisementDto } from './dto/Advertisement.dto';
import { Op } from 'sequelize';
import { Order } from 'sequelize/types';

@Injectable()
export class AdvertisementService {
  constructor(
    @Inject('ADVERTISEMENT_REPOSITORY')
    private advertisementRepository: typeof Advertisement,
  ) {}

  async create(data: CreateAdvertisementDto & { userId?: number; images?: string[] }) {
    try {
      // Валідація даних
      if (!data.productName || !data.category || !data.description) {
        throw new BadRequestException('Обов\'язкові поля не заповнені');
      }

      // Конвертація price в число якщо потрібно
      if (typeof data.price === 'string') {
        data.price = parseFloat(data.price);
      }

      // Створення оголошення
      const advertisement = await this.advertisementRepository.create({
        userId: data.userId,
        productName: data.productName,
        category: data.category,
        description: data.description,
        price: data.price,
        currency: data.currency,
        images: data.images || [],
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        region: data.region,
      });

      return advertisement;
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(err => err.message).join(', ');
        throw new BadRequestException(messages);
      }
      throw error;
    }
  }

  // async findAll

  async findAllAdmin(params: {
    whereId?: number,
    whereTitle?: string,
    whereStatus?: string,
    sortField?: string,
    sortDirection?: 'ASC' | 'DESC',
  }) {
    const { whereId, whereTitle, whereStatus, sortField, sortDirection } = params;

    const where: any = {};
    if (whereId) where.id = whereId;
    if (whereTitle) where.productName = { [Op.like]: `%${whereTitle}%` };
    if (whereStatus) where.status = whereStatus;

    const order: Order = [];
    if (sortField) {
      order.push([sortField, sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']);
    } else {
      order.push(['createdAt', 'DESC']);
    }

    return await this.advertisementRepository.findAll({
      where,
      order,
      include: ['author'],
    });
  }

  async findAll() {
    return await this.advertisementRepository.findAll({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']],
      include: ['author'] // Включити дані автора
    });
  }

   async findAndCount(id: number) {
    const { count: total, rows: data } = await this.advertisementRepository.findAndCountAll({
      where: { status: 'active', userId: id }
    });
 
    return { total, data };
  }

  async findById(id: number) {
    const advertisement = await this.advertisementRepository.findByPk(id, {
      include: ['author']
    });
    
    if (!advertisement) {
      throw new BadRequestException('Оголошення не знайдено');
    }

    // Збільшити кількість переглядів
    await advertisement.incrementViews();
    
    return advertisement;
  }

  async findAllWithFilters(params: {
    category?: string;
    city?: string;
    region?: string;
    search?: string;
    offset?: number;
    limit?: number;
    sortField?: string;
    sortDirection?: 'ASC' | 'DESC';
  }) {
    const {
      category,
      city,
      region,
      search,
      offset = 0,
      limit = 20,
      sortField,
      sortDirection = 'DESC',
    } = params;

    const where: any = {
      status: 'active',
    };

    if (category) where.category = category;
    if (city) where.city = city;
    if (region) where.region = region;

    if (search) {
      where.productName = { [Op.iLike]: `%${search}%` };
    }

    const order: Order = [];
    if (sortField) {
      order.push([sortField, sortDirection]);
    } else {
      order.push(['createdAt', 'DESC']);
    }

    const result = await this.advertisementRepository.findAndCountAll({
      where,
      order,
      offset,
      limit,
      include: ['author'],
    });

    return {
      rows: result.rows,
      count: result.count,
    };
  }
}