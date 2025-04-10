export interface UserCreationAttributes {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  bonuses?: number;
  resetToken?: string;
  resetTokenExpires?: Date;
}
