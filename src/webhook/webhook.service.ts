// src/webhook/webhook.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { OrdersService } from '@src/orders/orders.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private stripe: Stripe;

  // Używamy 'as string', aby zapewnić TS, że zmienna będzie dostępna
  // (w wersji produkcyjnej warto tu użyć @nestjs/config i ConfigService)
  private readonly endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  constructor(private readonly ordersService: OrdersService) {
    // Konstruktor Stripe wymaga klucza API, a nie webhooka
    this.stripe = new Stripe(process.env.STRIPE_API_SECRET as string);
  }

  async processWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.endpointSecret,
      );
    } catch (err: unknown) {
      // Obsługa typu 'unknown' w nowym TypeScripcie
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
      this.logger.error(`Błąd weryfikacji webhooka: ${errorMessage}`);
      throw new BadRequestException(`Webhook Error: ${errorMessage}`);
    }

    // 2. Obsługa konkretnych typów zdarzeń
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

    // Zazwyczaj podczas tworzenia sesji płatności przekazujesz ID zamówienia z Twojej bazy 
    // w polu 'metadata'. Tutaj je odzyskujesz:
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      this.logger.error('Brak orderId w metadanych sesji!');
      return;
    }

    await this.ordersService.markOrderPaid(Number(orderId));

    this.logger.log(`Zamówienie ${orderId} pomyślnie opłacone.`);
  }
}
