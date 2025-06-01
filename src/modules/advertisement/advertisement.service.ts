// advertisement.service.ts
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Advertisement } from './models/Advertisement.model';
import { CreateAdvertisementDto } from './dto/Advertisement.dto';

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

  async findAll() {
    return await this.advertisementRepository.findAll({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']],
      include: ['author'] // Включити дані автора
    });
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
}