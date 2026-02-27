import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { OrdersModule } from '@src/orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
