import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { ShopItem } from '@src/shop-items/entities/shop-item.entity';
import { Order } from '@src/orders/entities/order.entity';
import { OrderItem } from '@src/orders/entities/order-item.entity';
import { AuthModule } from '@src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShopItem, Order, OrderItem]),
    AuthModule,
  ],
  controllers: [PaymentsController],
})
export class PaymentsModule {}

