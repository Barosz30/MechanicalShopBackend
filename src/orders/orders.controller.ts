import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@src/auth/auth.guard';
import type { AuthenticatedRequest } from '@src/auth/auth.guard';

@Controller('api/orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':id')
  async getOrderSummary(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user;
    if (!user) {
      return null;
    }
    const order = await this.ordersService.findOneForUser(id, user.sub);
    const items = (order.orderItems ?? []).map((oi) => ({
      itemName: oi.item?.name ?? '—',
      quantity: oi.quantity,
      unitPrice: oi.unitPrice,
      lineTotal: oi.quantity * oi.unitPrice,
    }));
    return {
      id: order.id,
      items,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
    };
  }
}
