import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction, WhereOptions, Includeable, Order, OrderItem } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Advertisement } from './models/advertisement.model';
import { AdImage } from './models/ad-image.model';
import { AdAttribute } from './models/ad-attribute.model';
import { User } from '../users/models/users.model';
import { UserLike } from './models/user-like.model';
import { Subcategory } from './models/subcategory.model';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import { AdvertisementQueryDto } from './dto/advertisement-query.dto';
import { CreateAdvertisementAttributes } from './types/create-advertisement';

// Define a type for the paginated response
export interface PaginatedAdvertisementResponse {
  data: Advertisement[];
  total: number;
  pages: number;
}

@Injectable()
export class AdvertisementService {
  constructor(
    @InjectModel(Advertisement)
    private advertisementModel: typeof Advertisement,
    @InjectModel(Subcategory)
    private subcategoryModel: typeof Subcategory,
    @InjectModel(AdImage)
    private adImageModel: typeof AdImage,
    @InjectModel(AdAttribute)
    private adAttributeModel: typeof AdAttribute,
    @InjectModel(UserLike)
    private userLikeModel: typeof UserLike,
    private sequelize: Sequelize,
  ) {}


  
async create(userId: number, createAdDto: CreateAdvertisementDto): Promise<Advertisement> {
  
  const subcategory = await this.subcategoryModel.findByPk(createAdDto.subcategoryId);
  if (!subcategory) {
    throw new BadRequestException(`Subcategory with ID ${createAdDto.subcategoryId} does not exist`);
  }

  const result = await this.sequelize.transaction(async (t: Transaction) => {
    const {
      title,
      description,
      price,
      priceNegotiable,
      currency,
      condition,
      location,
      district,
      postalCode,
      deliveryOptions,
      exchangePossible,
      contactName,
      contactPhone,
      contactEmail,
      hidePhone,
      isPremium,
      isUrgent,
      isHighlighted,
      subcategoryId,
      expirationDate,
      images,
      attributes
    } = createAdDto;

    // Create the advertisement directly with the DTO data
    // Use type assertion to avoid TypeScript error with associations
    const advertisement = await this.advertisementModel.create({
      title,
      description,
      price: price || 0,
      priceNegotiable: priceNegotiable || false,
      currency: currency || 'UAH',
      condition,
      location,
      district: district || null,
      postalCode: postalCode || null,
      deliveryOptions: deliveryOptions || null,
      exchangePossible: exchangePossible || false,
      contactName,
      contactPhone: contactPhone || null,
      contactEmail: contactEmail || null,
      hidePhone: hidePhone || false,
      status: 'active',
      isPremium: isPremium || false,
      isUrgent: isUrgent || false,
      isHighlighted: isHighlighted || false,
      subcategoryId,
      authorId: userId,
      bumpDate: new Date(),
      expirationDate: expirationDate || this.calculateExpirationDate(),
      viewsCount: 0,
      phoneShowsCount: 0
    } as any, { transaction: t });

    if (images && images.length > 0) {
      const adImages = images.map(image => ({
        imageUrl: image.imageUrl,
        imageThumbnailUrl: image.imageThumbnailUrl || null,
        imageMediumUrl: image.imageMediumUrl || null,
        imageLargeUrl: image.imageLargeUrl || null,
        width: image.width || null,
        height: image.height || null,
        sizeKb: image.sizeKb || null,
        displayOrder: image.displayOrder || 0,
        isMain: image.isMain || false,
        adId: advertisement.id,
      }));

      await this.adImageModel.bulkCreate(adImages, { transaction: t });
    }

    if (attributes && attributes.length > 0) {
      const adAttrs = attributes.map(attr => ({
        name: attr.name,
        value: attr.value,
        unit: attr.unit || null,
        displayOrder: attr.displayOrder || 0,
        isSearchable: attr.isSearchable || false,
        isFilterable: attr.isFilterable || false,
        adId: advertisement.id,
      }));

      await this.adAttributeModel.bulkCreate(adAttrs, { transaction: t });
    }

    return advertisement;
  });

  return this.findOne(result.id);
}


  async findAll(query: AdvertisementQueryDto): Promise<PaginatedAdvertisementResponse> {
    const { page = 1, limit = 10, search, subcategoryId, location, district, condition, 
            minPrice, maxPrice, authorId, isPremium, isUrgent, exchangePossible,
            sortBy, sortDirection, attributes } = query;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions: WhereOptions<any> = {
      status: 'active', // Only show active ads by default
    };

    if (search) {
      whereConditions[Op.or as any] = [
        { title: { [Op.iLike as any]: `%${search}%` } },
        { description: { [Op.iLike as any]: `%${search}%` } },
      ];
    }

    if (subcategoryId) {
      whereConditions.subcategoryId = subcategoryId;
    }

    if (location) {
      whereConditions.location = { [Op.iLike as any]: `%${location}%` };
    }

    if (district) {
      whereConditions.district = { [Op.iLike as any]: `%${district}%` };
    }

    if (condition) {
      whereConditions.condition = condition;
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      whereConditions.price = { [Op.between as any]: [minPrice, maxPrice] };
    } else if (minPrice !== undefined) {
      whereConditions.price = { [Op.gte as any]: minPrice };
    } else if (maxPrice !== undefined) {
      whereConditions.price = { [Op.lte as any]: maxPrice };
    }

    if (authorId) {
      whereConditions.authorId = authorId;
    }

    if (isPremium !== undefined) {
      whereConditions.isPremium = isPremium;
    }

    if (isUrgent !== undefined) {
      whereConditions.isUrgent = isUrgent;
    }

    if (exchangePossible !== undefined) {
      whereConditions.exchangePossible = exchangePossible;
    }

    // Parse attributes filter if provided
    let attributeInclude: Includeable[] = [];
    if (attributes) {
      try {
        const attributePairs = attributes.split(',');
        const attributeFilters = attributePairs.map(pair => {
          const [name, value] = pair.split(':');
          return { name, value };
        });

        // Add attribute conditions via include
        attributeInclude = [{
          model: AdAttribute,
          where: {
            [Op.or as any]: attributeFilters.map(filter => ({
              name: filter.name,
              value: { [Op.iLike as any]: `%${filter.value}%` },
            })),
          },
          required: true,
        } as Includeable];
      } catch (error) {
        throw new BadRequestException('Invalid attributes format. Use "name1:value1,name2:value2"');
      }
    }

    // Prepare include array for the query
    const includeArray: Includeable[] = [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
      },
      {
        model: Subcategory,
      },
      {
        model: AdImage,
        separate: true, // Use separate query to improve performance
        order: [['isMain', 'DESC'], ['displayOrder', 'ASC']] as Order,
      }
    ];

    // Add attributes model if needed
    if (!attributes) {
      includeArray.push({
        model: AdAttribute,
        separate: true, // Use separate query
        order: [['displayOrder', 'ASC']] as Order,
      });
    } else {
      includeArray.push(...attributeInclude);
    }

    // Perform the query
    const { count, rows } = await this.advertisementModel.findAndCountAll({
      where: whereConditions,
      include: includeArray,
      order: [[sortBy || 'bumpDate', sortDirection || 'DESC']],
      limit,
      offset,
      distinct: true, // Important for correct count with associations
    });

    return {
      data: rows,
      total: count,
      pages: Math.ceil(count / limit),
    };
  }

  async findOne(id: number): Promise<Advertisement> {
    const advertisement = await this.advertisementModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
        {
          model: Subcategory,
        },
        {
          model: AdImage,
          order: [['isMain', 'DESC'], ['displayOrder', 'ASC']] as Order,
        },
        {
          model: AdAttribute,
          order: [['displayOrder', 'ASC']] as Order,
        },
      ],
    });

    if (!advertisement) {
      throw new NotFoundException(`Advertisement with ID ${id} not found`);
    }

    // Increment view count
    await advertisement.increment('viewsCount');

    return advertisement;
  }

  async update(
    userId: number,
    id: number, 
    updateAdDto: UpdateAdvertisementDto
  ): Promise<Advertisement> {
    const advertisement = await this.advertisementModel.findByPk(id);
    
    if (!advertisement) {
      throw new NotFoundException(`Advertisement with ID ${id} not found`);
    }

    // Check if user owns this advertisement
    if (advertisement.authorId !== userId) {
      throw new ForbiddenException('You can only update your own advertisements');
    }

    const result = await this.sequelize.transaction(async (t: Transaction) => {
      // Update the advertisement
      await advertisement.update(updateAdDto, { transaction: t });

      // Handle images
      if (updateAdDto.imagesToAdd && updateAdDto.imagesToAdd.length > 0) {
        const adImages = updateAdDto.imagesToAdd.map(image => ({
          ...image,
          adId: advertisement.id,
        }));

        await this.adImageModel.bulkCreate(adImages, { transaction: t });
      }

      if (updateAdDto.imagesToRemove && updateAdDto.imagesToRemove.length > 0) {
        await this.adImageModel.destroy({
          where: {
            id: { [Op.in]: updateAdDto.imagesToRemove },
            adId: advertisement.id, // Important security check
          },
          transaction: t,
        });
      }

      // Handle attributes
      if (updateAdDto.attributesToAdd && updateAdDto.attributesToAdd.length > 0) {
        const adAttributes = updateAdDto.attributesToAdd.map(attr => ({
          ...attr,
          adId: advertisement.id,
        }));

        await this.adAttributeModel.bulkCreate(adAttributes, { transaction: t });
      }

      if (updateAdDto.attributesToRemove && updateAdDto.attributesToRemove.length > 0) {
        await this.adAttributeModel.destroy({
          where: {
            id: { [Op.in]: updateAdDto.attributesToRemove },
            adId: advertisement.id, // Important security check
          },
          transaction: t,
        });
      }

      return advertisement;
    });

    // Return updated advertisement with associations
    return this.findOne(id);
  }

  async remove(userId: number, id: number): Promise<void> {
    const advertisement = await this.advertisementModel.findByPk(id);
    
    if (!advertisement) {
      throw new NotFoundException(`Advertisement with ID ${id} not found`);
    }

    // Check if user owns this advertisement
    if (advertisement.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own advertisements');
    }

    // Instead of hard deleting, update status to 'deleted'
    await advertisement.update({ status: 'deleted' });
  }
  
  async bumpAdvertisement(userId: number, id: number): Promise<Advertisement> {
    const advertisement = await this.advertisementModel.findByPk(id);
    
    if (!advertisement) {
      throw new NotFoundException(`Advertisement with ID ${id} not found`);
    }

    // Check if user owns this advertisement
    if (advertisement.authorId !== userId) {
      throw new ForbiddenException('You can only bump your own advertisements');
    }

    // Update bump date to current time
    await advertisement.update({ bumpDate: new Date() });
    
    return this.findOne(id);
  }

  async toggleLike(userId: number, adId: number): Promise<{ liked: boolean }> {
    const advertisement = await this.advertisementModel.findByPk(adId);
    
    if (!advertisement) {
      throw new NotFoundException(`Advertisement with ID ${adId} not found`);
    }

    // Check if user already liked this ad
    const existingLike = await this.userLikeModel.findOne({
      where: { userId, adId },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      return { liked: false };
    } else {
      // Like
      await this.userLikeModel.create({ userId, adId });
      return { liked: true };
    }
  }

  async getUserLikedAds(
    userId: number, 
    query: AdvertisementQueryDto
  ): Promise<PaginatedAdvertisementResponse> {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await this.advertisementModel.findAndCountAll({
      include: [
        {
          model: User,
          as: 'likedByUsers',
          where: { id: userId },
          attributes: [],
          through: { attributes: [] },
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
        {
          model: Subcategory,
        },
        {
          model: AdImage,
          separate: true,
          order: [['isMain', 'DESC'], ['displayOrder', 'ASC']] as Order,
        },
        {
          model: AdAttribute,
          separate: true,
          order: [['displayOrder', 'ASC']] as Order,
        },
      ],
      where: { status: 'active' },
      order: [['bumpDate', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      data: rows,
      total: count,
      pages: Math.ceil(count / limit),
    };
  }

  async getUserAds(
    userId: number, 
    query: AdvertisementQueryDto
  ): Promise<PaginatedAdvertisementResponse> {
    // Extract status from query with default value, assuming it's defined in AdvertisementQueryDto 
    const { page = 1, limit = 10, status = 'active' } = query as AdvertisementQueryDto & { status?: string };
    const offset = (page - 1) * limit;
    
    const { count, rows } = await this.advertisementModel.findAndCountAll({
      where: { 
        authorId: userId,
        status, // Filter by status
      },
      include: [
        {
          model: Subcategory,
        },
        {
          model: AdImage,
          separate: true,
          order: [['isMain', 'DESC'], ['displayOrder', 'ASC']] as Order,
        },
        {
          model: AdAttribute,
          separate: true,
          order: [['displayOrder', 'ASC']] as Order,
        },
      ],
      order: [['bumpDate', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      data: rows,
      total: count,
      pages: Math.ceil(count / limit),
    };
  }

  async markAsSold(userId: number, id: number): Promise<Advertisement> {
    const advertisement = await this.advertisementModel.findByPk(id);
    
    if (!advertisement) {
      throw new NotFoundException(`Advertisement with ID ${id} not found`);
    }

    // Check if user owns this advertisement
    if (advertisement.authorId !== userId) {
      throw new ForbiddenException('You can only manage your own advertisements');
    }

    // Update status to 'sold'
    await advertisement.update({ status: 'sold' });
    
    return this.findOne(id);
  }

  async incrementPhoneShowCount(id: number): Promise<void> {
    const advertisement = await this.advertisementModel.findByPk(id);
    
    if (!advertisement) {
      throw new NotFoundException(`Advertisement with ID ${id} not found`);
    }

    await advertisement.increment('phoneShowsCount');
  }

  // Helper method to calculate expiration date (30 days from now by default)
  private calculateExpirationDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }
}