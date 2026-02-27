import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { ShopItem } from '@src/shop-items/entities/shop-item.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.orderItems, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  order: Order;

  @ManyToOne(() => ShopItem, { nullable: false, onDelete: 'RESTRICT' })
  item: ShopItem;

  @Column({ type: 'int' })
  quantity: number;

  /** Cena jednostkowa w PLN w momencie zakupu (jak ShopItem.price) */
  @Column({ type: 'int' })
  unitPrice: number;
}
