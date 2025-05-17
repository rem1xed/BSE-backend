import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Unique,
    AllowNull,
    CreatedAt,
    UpdatedAt
  } from 'sequelize-typescript';

  @Table({ tableName: 'admins' })
  export class Admin extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    idk: number;

    @AllowNull(false)
    @Unique
    @Column(DataType.STRING)
    email: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    password: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    secretKey: string; // Access key

    @Column({ type: DataType.BOOLEAN, defaultValue: true })
    isActive: boolean;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;
  }
