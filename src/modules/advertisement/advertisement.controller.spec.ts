import { Test, TestingModule } from '@nestjs/testing';
import { AdvertisementController } from './advertisement.controller';

describe('AdvertisementController', () => {
  let controller: AdvertisementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdvertisementController],
    }).compile();

    controller = module.get<AdvertisementController>(AdvertisementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
