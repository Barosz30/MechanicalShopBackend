import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { ShopItem } from '@src/shop-items/entities/shop-item.entity';
import { Order } from '@src/orders/entities/order.entity';
import { OrdersService } from '@src/orders/orders.service';
import { AuthGuard } from '@src/auth/auth.guard';
import type { AuthenticatedRequest } from '@src/auth/auth.guard';

class CreateCheckoutSessionDto {
  itemId: number;
  quantity?: number;
}

@Controller('api/payments')
export class PaymentsController {
  private stripe: Stripe;
  private readonly frontendUrl: string;

  constructor(
    @InjectRepository(ShopItem)
    private readonly shopItemsRepository: Repository<ShopItem>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly ordersService: OrdersService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_API_SECRET as string);
    this.frontendUrl =
      process.env.FRONTEND_URL ?? 'http://localhost:4200';
  }

  @UseGuards(AuthGuard)
  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body() body: CreateCheckoutSessionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    const quantity = body.quantity && body.quantity > 0 ? body.quantity : 1;

    const item = await this.shopItemsRepository.findOne({
      where: { id: body.itemId },
    });

    if (!item) {
      throw new Error('Przedmiot nie istnieje');
    }

    const totalAmount = item.price * quantity;

    const order = this.ordersRepository.create({
      user: { id: user.sub } as any,
      item: { id: item.id } as any,
      quantity,
      totalAmount,
      status: 'PENDING',
    });
    await this.ordersRepository.save(order);

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100,
          },
          quantity,
        },
      ],
      metadata: {
        orderId: order.id.toString(),
        userId: user.sub.toString(),
      },
      success_url: `${this.frontendUrl}/payment-success?orderId=${order.id}`,
      cancel_url: `${this.frontendUrl}/payment-cancel?orderId=${order.id}`,
    });

    await this.ordersRepository.update(
      { id: order.id },
      { stripeSessionId: session.id },
    );

    return { url: session.url };
  }
}

