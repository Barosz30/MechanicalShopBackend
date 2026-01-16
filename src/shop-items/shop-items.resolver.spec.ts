import { Test, TestingModule } from '@nestjs/testing';
import { ShopItemsResolver } from './shop-items.resolver';
import { ShopItemsService } from './shop-items.service';

describe('ShopItemsResolver', () => {
  let resolver: ShopItemsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopItemsResolver, ShopItemsService],
    }).compile();

    resolver = module.get<ShopItemsResolver>(ShopItemsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
