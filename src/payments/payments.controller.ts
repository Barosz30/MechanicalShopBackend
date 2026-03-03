import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  ParseIntPipe,
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
import { OrderItem } from '@src/orders/entities/order-item.entity';
import { AuthGuard } from '@src/auth/auth.guard';
import type { AuthenticatedRequest } from '@src/auth/auth.guard';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

class LineItemDto {
  @IsInt()
  itemId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

class CreateCheckoutSessionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  @ArrayMinSize(1)
  items: LineItemDto[];
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
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
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

    const lines: { item: ShopItem; quantity: number }[] = [];
    let totalAmount = 0;

    for (const line of body.items) {
      const item = await this.shopItemsRepository.findOne({
        where: { id: line.itemId },
      });
      if (!item) {
        throw new BadRequestException(
          `Przedmiot o ID ${line.itemId} nie istnieje`,
        );
      }
      const qty = Math.max(1, line.quantity ?? 1);
      totalAmount += item.price * qty;
      lines.push({ item, quantity: qty });
    }

    const order = this.ordersRepository.create({
      user: { id: user.sub } as any,
      totalAmount,
      status: 'PENDING',
    });
    await this.ordersRepository.save(order);

    for (const { item, quantity } of lines) {
      const oi = this.orderItemRepository.create({
        order,
        item,
        quantity,
        unitPrice: item.price,
      });
      await this.orderItemRepository.save(oi);
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lines.map(({ item, quantity }) => ({
        price_data: {
          currency: 'pln',
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100,
        },
        quantity,
      })),
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

  @UseGuards(AuthGuard)
  @Post('create-checkout-session-for-order/:orderId')
  async createCheckoutSessionForOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException();
    }

    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems', 'orderItems.item', 'user'],
    });
    if (!order) {
      throw new NotFoundException('Zamówienie nie istnieje');
    }
    if (order.user.id !== user.sub) {
      throw new ForbiddenException('To zamówienie nie należy do Ciebie');
    }
    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        'Płatność możliwa tylko dla zamówień w statusie PENDING',
      );
    }
    if (!order.orderItems?.length) {
      throw new BadRequestException('Zamówienie nie zawiera pozycji');
    }

    const lineItems = order.orderItems.map((oi) => ({
      price_data: {
        currency: 'pln',
        product_data: {
          name: oi.item.name,
        },
        unit_amount: oi.unitPrice * 100,
      },
      quantity: oi.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
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
