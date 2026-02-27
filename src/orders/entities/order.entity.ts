import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@src/users/entities/user.entity';
import { OrderItem } from './order-item.entity';

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => OrderItem, (oi) => oi.order, { cascade: true })
  orderItems: OrderItem[];

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
