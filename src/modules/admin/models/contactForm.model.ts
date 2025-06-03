import { Table, Column, Model, DataType} from 'sequelize-typescript';

@Table({
  tableName: 'ContactForm',
})
export class ContactForm extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id',
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'fullName',
  })
  fullName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'email',
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'phone',
  })
  phone: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'problem',
  })
  problem: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'date',
  })
  date: string;
}