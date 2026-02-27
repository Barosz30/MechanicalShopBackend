// src/webhook/webhook.controller.ts
import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';

@Controller('api/webhooks/stripe')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  async handleIncomingEvents(
    @Headers('stripe-signature') signature: string | undefined,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Brak sygnatury Stripe');
    }

    // TS wie, że rawBody może być undefined, więc musimy to obsłużyć
    if (!request.rawBody) {
      throw new BadRequestException('Brak surowych danych (rawBody) w żądaniu');
    }

    return this.webhookService.processWebhook(request.rawBody, signature);
  }
}