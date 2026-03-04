import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return (
      'go to https://mechanicalshopbackend.onrender.com/graphql for graphql routes\n' +
      'go to https://mechanicalshopbackend.onrender.com/api for swagger'
    );
  }
}
