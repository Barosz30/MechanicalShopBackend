import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@src/users/entities/user.entity';
import { ShopItem } from '@src/shop-items/entities/shop-item.entity';

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => ShopItem, { nullable: false, onDelete: 'RESTRICT' })
  item: ShopItem;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'int' })
  totalAmount: number;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: OrderStatus;

  @Column({ type: 'varchar', nullable: true })
  stripeSessionId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  stripePaymentIntentId?: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

