import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Index } from 'sequelize-typescript';
import { User } from '../../users/users.model'

enum CategoryEnum {
  ELECTRONICS = 'electronics',
  FURNITURE = 'furniture',
  CLOTHES = 'clothes',
  BOOKS = 'books',
  CARS = 'cars',
  PROPERTY = 'property',
  SPORTS = 'sports',
  HOME = 'home',
  BEAUTY = 'beauty',
  CHILDREN = 'children',
  ANIMALS = 'animals',
  HOBBY = 'hobby',
  BUSINESS = 'business',
  OTHER = 'other'
}

enum StatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SOLD = 'sold',
  ARCHIVED = 'archived',
  PENDING_REVIEW = 'pending_review'
}

enum CurrencyEnum {
  UAH = 'UAH',
  USD = 'USD',
  EUR = 'EUR'
}

@Table({ 
  tableName: 'Advertisements',
  timestamps: true,
  paranoid: true
})
export class Advertisement extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  @Index
  userId: number;

  @BelongsTo(() => User)
  author: User;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Назва товару не може бути пустою' },
      len: { args: [2, 255], msg: 'Назва товару повинна містити від 2 до 255 символів' }
    }
  })
  @Index
  productName: string;

  @Column({
    type: DataType.ENUM(...Object.values(CategoryEnum)),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Категорія повинна бути обрана' }
    }
  })
  @Index
  category: CategoryEnum;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Опис товару не може бути пустим' },
      len: { args: [10, 2000], msg: 'Опис товару повинен містити від 10 до 2000 символів' }
    }
  })
  description: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: { msg: 'Ціна повинна бути числом' },
      min: { args: [0.01], msg: 'Ціна повинна бути більше 0' },
      max: { args: [99999999.99], msg: 'Ціна занадто велика' }
    }
  })
  @Index
  price: number;

  @Column({
    type: DataType.ENUM(...Object.values(CurrencyEnum)),
    allowNull: false,
    defaultValue: CurrencyEnum.UAH
  })
  currency: CurrencyEnum;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: [],
    validate: {
      isValidImages(value: string[]) {
        if (value && Array.isArray(value)) {
          if (value.length > 8) {
            throw new Error('Максимум 8 фотографій');
          }
          value.forEach(img => {
            if (typeof img !== 'string' || !img.match(/^https?:\/\/.+/)) {
              throw new Error('Невірний формат зображення');
            }
          });
        }
      }
    }
  })
  images: string[];

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Ім\'я контактної особи не може бути пустим' },
      len: { args: [2, 100], msg: 'Ім\'я повинно містити від 2 до 100 символів' }
    }
  })
  contactName: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      isEmail: { msg: 'Невірний формат email' },
      notEmpty: { msg: 'Email не може бути пустим' }
    }
  })
  email: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Номер телефону не може бути пустим' },
      is: { args: /^[\+]?[0-9\s\-\(\)]{10,20}$/, msg: 'Невірний формат номера телефону' }
    }
  })
  phone: string;

  @Column({
    type: DataType.ENUM(...Object.values(StatusEnum)),
    allowNull: false,
    defaultValue: StatusEnum.PENDING_REVIEW
  })
  @Index
  status: StatusEnum;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
  })
  views: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true
  })
  @Index
  city: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true
  })
  region: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  isPromoted: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  promotedUntil: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  @Index
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  declare updatedAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare deletedAt: Date;

  // Методи екземпляра
  incrementViews(): Promise<Advertisement> {
    return this.increment('views');
  }

  isActive(): boolean {
    return this.status === StatusEnum.ACTIVE;
  }

  isSold(): boolean {
    return this.status === StatusEnum.SOLD;
  }

  isPromotedNow(): boolean {
    return this.isPromoted && 
           this.promotedUntil && 
           new Date() < this.promotedUntil;
  }

  // Статичні методи
  static async findByCategory(category: CategoryEnum, limit: number = 10) {
    return this.findAll({
      where: { 
        category,
        status: StatusEnum.ACTIVE 
      },
      limit,
      order: [['createdAt', 'DESC']]
    });
  }

  static async findByPriceRange(minPrice: number, maxPrice: number) {
    return this.findAll({
      where: {
        price: {
          $gte: minPrice,
          $lte: maxPrice
        },
        status: StatusEnum.ACTIVE
      }
    });
  }

  static async findPromoted(limit: number = 5) {
    return this.findAll({
      where: {
        isPromoted: true,
        promotedUntil: {
          $gt: new Date()
        },
        status: StatusEnum.ACTIVE
      },
      limit,
      order: [['promotedUntil', 'DESC']]
    });
  }

  static async getPopular(limit: number = 10) {
    return this.findAll({
      where: {
        status: StatusEnum.ACTIVE
      },
      order: [['views', 'DESC']],
      limit
    });
  }
}

// Експорт енумів для використання в інших частинах додатку
export { CategoryEnum, StatusEnum, CurrencyEnum };