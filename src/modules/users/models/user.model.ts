import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'Users',
})
export class User extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstName: string; // тільки колонка Sequelize

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  // Інші поля...
}