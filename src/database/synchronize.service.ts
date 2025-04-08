import { Injectable, OnModuleInit } from '@nestjs/common';
import { Sequelize } from 'sequelize';


@Injectable()
export class SynchronizeService implements OnModuleInit {
  constructor(private readonly sequelize: Sequelize) {}

  async onModuleInit() {
    await this.sequelize.sync({ force: true });
  }
}
