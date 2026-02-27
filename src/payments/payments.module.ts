import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { ShopItem } from '@src/shop-items/entities/shop-item.entity';
import { Order } from '@src/orders/entities/order.entity';
import { OrdersModule } from '@src/orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShopItem, Order]),
    OrdersModule,
  ],
  controllers: [PaymentsController],
})
export class PaymentsModule {}

