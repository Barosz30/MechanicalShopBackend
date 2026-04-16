import { Module } from '@nestjs/common';
import { ShopItemsService } from './shop-items.service';
import { ShopItemsResolver } from './shop-items.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopItem } from './entities/shop-item.entity';
import { ShopItemDetails } from './entities/shop-item-details.entity';
import { Category } from '../categories/entities/category.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ShopItem, ShopItemDetails, Category]), AuthModule],
  providers: [ShopItemsResolver, ShopItemsService],
})
export class ShopItemsModule {}
