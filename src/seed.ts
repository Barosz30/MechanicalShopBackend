import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker'; // Generator danych
import { config } from 'dotenv';
import { ShopItem } from './shop-items/entities/shop-item.entity';
import { Category } from './categories/entities/category.entity';
import { ShopItemDetails } from './shop-items/entities/shop-item-details.entity';
// Ładujemy zmienne środowiskowe (.env)
config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [ShopItem, Category, ShopItemDetails], // Musimy podać encje
  synchronize: false,
  ssl: true,
});

async function runSeed() {
  console.log('🌱 Rozpoczynam sianie danych...');

  // 1. Połącz z bazą
  await dataSource.initialize();
  const shopItemRepo = dataSource.getRepository(ShopItem);
  const categoryRepo = dataSource.getRepository(Category);

  // 2. Wyczyść stare dane (opcjonalne, ale przydatne)
  console.log('🧹 Czyszczenie bazy...');
  // Kolejność ważna: najpierw usuwamy przedmioty, potem kategorie (bo klucz obcy)
  await shopItemRepo.createQueryBuilder().delete().execute();
  await categoryRepo.createQueryBuilder().delete().execute();

  // 3. Stwórz Kategorie
  console.log('📦 Tworzenie kategorii...');
  const categoriesData = [
    'Rowery MTB',
    'Rowery Szosowe',
    'Kaski',
    'Oświetlenie',
    'Części',
  ];
  const categories: Category[] = [];

  for (const name of categoriesData) {
    const cat = categoryRepo.create({
      name,
      description: faker.lorem.sentence(),
    });
    await categoryRepo.save(cat);
    categories.push(cat);
  }

  // 4. Stwórz Produkty
  console.log('🚲 Tworzenie produktów...');
  const items: ShopItem[] = [];

  for (let i = 0; i < 50; i++) {
    const randomCategory = faker.helpers.arrayElement(categories); // Losowa kategoria z listy

    const item = shopItemRepo.create({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseInt(faker.commerce.price({ min: 100, max: 10000 })), // Cena 100-10000
      isAvailable: faker.datatype.boolean(),
      category: randomCategory,
      details: {
        color: faker.color.human(),
        manufacturer: faker.vehicle.manufacturer(),
        material: faker.helpers.arrayElement(['Aluminium', 'Carbon', 'Steel']),
        weight: faker.number.float({ min: 8, max: 15, fractionDigits: 1 }), // waga 8-15kg
      },
    });

    items.push(item);
  }

  // Zapisujemy wszystko w jednej paczce (szybciej)
  await shopItemRepo.save(items);

  console.log(
    `✅ Zakończono! Dodano ${categories.length} kategorii i ${items.length} produktów.`,
  );
  await dataSource.destroy();
}

runSeed().catch((error) => {
  console.error('❌ Błąd seedowania:', error);
  process.exit(1);
});
