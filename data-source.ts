import { DataSource } from 'typeorm';
import { ShopItem } from './src/shop-items/entities/shop-item.entity';
import { ShopItemDetails } from './src/shop-items/entities/shop-item-details.entity';
import * as dotenv from 'dotenv';
import { Category } from './src/categories/entities/category.entity';
import { User } from './src/users/entities/user.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [ShopItem, ShopItemDetails, Category, User], // Musimy tu wskazać konkretne encje
  migrations: ['./src/migrations/*.ts'], // Gdzie mają lądować pliki migracji
  synchronize: false, // Ważne: false przy migracjach
  ssl: true,
});
