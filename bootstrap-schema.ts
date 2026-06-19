import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { ShopItem } from './src/shop-items/entities/shop-item.entity';
import { ShopItemDetails } from './src/shop-items/entities/shop-item-details.entity';
import { Category } from './src/categories/entities/category.entity';
import { User } from './src/users/entities/user.entity';
import { Order } from './src/orders/entities/order.entity';
import { OrderItem } from './src/orders/entities/order-item.entity';

dotenv.config();

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [ShopItem, ShopItemDetails, Category, User, Order, OrderItem],
  synchronize: true,
  ssl: true,
});

ds.initialize()
  .then(async () => {
    console.log('Schema synchronized from entities.');
    await ds.destroy();
  })
  .catch((err) => {
    console.error('Schema bootstrap failed:', err);
    process.exit(1);
  });
