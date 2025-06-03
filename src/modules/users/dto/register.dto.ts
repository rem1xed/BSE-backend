export interface UserCreationAttributes {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
  key?: string; // ← зробити необов'язковим
  // bonuses?: number;
  // resetToken?: string;
  // resetTokenExpires?: Date;
}