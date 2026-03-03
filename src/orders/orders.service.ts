import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async findAllForUser(userId: number) {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: ['orderItems', 'orderItems.item'],
      order: { createdAt: 'DESC' },
    });
  }

  async markOrderPaid(orderId: number): Promise<void> {
    await this.ordersRepository.update(
      { id: orderId },
      { status: 'PAID' },
    );
  }

  async findOneForUser(orderId: number, userId: number) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['orderItems', 'orderItems.item'],
    });
    if (!order) {
      throw new NotFoundException('Zamówienie nie istnieje');
    }
    return order;
  }
}

