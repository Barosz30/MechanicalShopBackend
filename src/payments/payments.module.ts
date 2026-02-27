import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { ShopItem } from '@src/shop-items/entities/shop-item.entity';
import { Order } from '@src/orders/entities/order.entity';
import { OrdersModule } from '@src/orders/orders.module';
import { AuthModule } from '@src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShopItem, Order]),
    OrdersModule,
    AuthModule,
  ],
  controllers: [PaymentsController],
})
export class PaymentsModule {}

