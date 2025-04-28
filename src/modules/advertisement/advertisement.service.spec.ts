import { Test, TestingModule } from '@nestjs/testing';
import { AdvertisementService } from './advertisement.service';

describe('AdvertisementService', () => {
  let service: AdvertisementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdvertisementService],
    }).compile();

    service = module.get<AdvertisementService>(AdvertisementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
