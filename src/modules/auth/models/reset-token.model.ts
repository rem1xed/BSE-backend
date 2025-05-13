// src/modules/auth/models/reset-token.model.ts
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'reset_tokens' })
export class ResetToken extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  code: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isUsed: boolean;
}