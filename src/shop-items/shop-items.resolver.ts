import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import { ShopItemsService } from './shop-items.service';
import { ShopItem } from './entities/shop-item.entity';
import { CreateShopItemInput } from './dto/create-shop-item.input';
import { UpdateShopItemInput } from './dto/update-shop-item.input';
import { SortOrder } from 'src/common/enums/sort-order.enum';
import { ShopItemSortBy } from 'src/common/enums/shop-item-sort-by.enum';
import { GetShopItemsFilterInput } from './dto/get-shop-items-filter.input';

registerEnumType(SortOrder, {
  name: 'SortOrder',
});

registerEnumType(ShopItemSortBy, {
  name: 'ShopItemSortBy',
});

@Resolver(() => ShopItem)
export class ShopItemsResolver {
  constructor(private readonly shopItemsService: ShopItemsService) {}

  @Mutation(() => ShopItem)
  createShopItem(
    @Args('createShopItemInput') createShopItemInput: CreateShopItemInput,
  ) {
    return this.shopItemsService.create(createShopItemInput);
  }

  @Query(() => [ShopItem], { name: 'shopItems' })
  findAll(
    @Args('filter', { nullable: true }) filter?: GetShopItemsFilterInput,
  ) {
    return this.shopItemsService.findAll(
      filter || new GetShopItemsFilterInput(),
    );
  }

  @Query(() => ShopItem, { name: 'shopItem' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.shopItemsService.findOne(id);
  }

  @Mutation(() => ShopItem)
  updateShopItem(
    @Args('updateShopItemInput') updateShopItemInput: UpdateShopItemInput,
  ) {
    return this.shopItemsService.update(
      updateShopItemInput.id,
      updateShopItemInput,
    );
  }

  @Mutation(() => ShopItem)
  removeShopItem(@Args('id', { type: () => Int }) id: number) {
    return this.shopItemsService.remove(id);
  }
}
