//create-advertisement.d
export type CreateAdvertisementAttributes = {
  title: string;
  description: string;
  price: number;
  priceNegotiable: boolean;
  currency: string;
  condition: string;
  location: string;
  district: string | null;
  postalCode: string | null;
  deliveryOptions: string | null;
  exchangePossible: boolean;
  contactName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  hidePhone: boolean;
  status: string;
  isPremium: boolean;
  isUrgent: boolean;
  isHighlighted: boolean;
  subcategoryId: number;
  authorId: number;
  bumpDate: Date;
  expirationDate: Date;
};