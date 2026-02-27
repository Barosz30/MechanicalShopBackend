import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async markOrderPaid(orderId: number): Promise<void> {
    await this.ordersRepository.update(
      { id: orderId },
      { status: 'PAID' },
    );
  }
}

