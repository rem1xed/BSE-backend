
export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  sku: string;
  quantity: number;
  categoryId: number;
}

export class UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  quantity?: number;
  categoryId?: number;
}

export class ProductResponseDto {
  id: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  quantity: number;
  categoryId: number;
  category?: {
    id: number;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}