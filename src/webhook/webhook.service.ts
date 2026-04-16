// src/webhook/webhook.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { OrdersService } from '@src/orders/orders.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private stripe: Stripe | null = null;

  private readonly endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  constructor(private readonly ordersService: OrdersService) {}

  private getStripe(): Stripe {
    if (this.stripe) {
      return this.stripe;
    }

    const apiSecret = process.env.STRIPE_API_SECRET;
    if (!apiSecret) {
      throw new Error('Missing STRIPE_API_SECRET environment variable');
    }

    this.stripe = new Stripe(apiSecret);
    return this.stripe;
  }

  async processWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      const stripe = this.getStripe();
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.endpointSecret,
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
      this.logger.error(`Błąd weryfikacji webhooka: ${errorMessage}`);
      throw new BadRequestException(`Webhook Error: ${errorMessage}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleSuccessfulPayment(session);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        this.logger.warn(`Płatność odrzucona dla ID: ${failedPayment.id}`);
        break;

      default:
        this.logger.log(`Nieskonfigurowane zdarzenie: ${event.type}`);
    }

    return { received: true };
  }

  private async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    this.logger.log(`Płatność zakończona sukcesem dla sesji: ${session.id}`);

    const orderId = session.metadata?.orderId;

    if (!orderId) {
      this.logger.error('Brak orderId w metadanych sesji!');
      return;
    }

    await this.ordersService.markOrderPaid(Number(orderId));

    this.logger.log(`Zamówienie ${orderId} pomyślnie opłacone.`);
  }
}
