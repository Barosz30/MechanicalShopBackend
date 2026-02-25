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

  // 3. Stwórz Kategorie (z dopasowanymi zdjęciami i danymi produktów)
  console.log('📦 Tworzenie kategorii...');
  const categoriesConfig: {
    name: string;
    description: string;
    imageUrl: string;
    productNames: string[];
    productDescriptions: string[];
  }[] = [
    {
      name: 'Rowery MTB',
      description: 'Pokonuj szlaki bez ograniczeń.',
      imageUrl: 'https://res.cloudinary.com/dpycpc1op/image/upload/v1772021234/nest-items/xeqaqvbth3o1manzdmla.webp',
      productNames: ['Rower MTB Trail Pro', 'Rower górski XC 29"', 'Full Suspension Enduro', 'Hardtail MTB 27.5"', 'Rower górski do zjazdu'],
      productDescriptions: [
        'Wytrzymały rower górski na szlaki i single track.',
        'Lekka rama, doskonały do cross-country.',
        'Amortyzacja przednia i tylna dla wymagających tras.',
        'Uniwersalny hardtail do codziennej jazdy w terenie.',
        'Stabilność i kontrola na stromych zjazdach.',
      ],
    },
    {
      name: 'Rowery Szosowe',
      description: 'Lekkość i maksymalna prędkość na szosie.',
      imageUrl: 'https://res.cloudinary.com/dpycpc1op/image/upload/v1772021177/nest-items/amemlppofzc5nwhaqxt6.webp',
      productNames: ['Rower szosowy Carbon', 'Rower wyścigowy Aero', 'Szosa endurance', 'Rower szosowy do triathlonu', 'Gravel road'],
      productDescriptions: [
        'Rama z włókna węglowego, minimalna waga.',
        'Aerodynamiczna geometria dla maksymalnej prędkości.',
        'Wygodna pozycja na długie dystanse.',
        'Geometria triathlonowa, osprzęt do czasówek.',
        'Uniwersalny rower na asfalt i lekkie tereny.',
      ],
    },
    {
      name: 'Kaski',
      description: 'Bezpieczeństwo w dobrym stylu.',
      imageUrl: 'https://res.cloudinary.com/dpycpc1op/image/upload/v1772022337/nest-items/trhmdundfmxpvmstgx1t.webp?w=400',
      productNames: ['Kask MTB z osłoną', 'Kask szosowy aerodynamiczny', 'Kask gravel z daszkiem', 'Kask enduro full face', 'Kask miejski'],
      productDescriptions: [
        'Ochrona głowy z osłoną na szlaki.',
        'Lekki, przewiewny kask na szosę.',
        'Daszek chroniący przed słońcem i błotem.',
        'Pełna osłona twarzy do ekstremalnej jazdy.',
        'Stylowy kask do jazdy po mieście.',
      ],
    },
    {
      name: 'Oświetlenie',
      description: 'Rozświetl mrok na każdej trasie.',
      imageUrl: 'https://res.cloudinary.com/dpycpc1op/image/upload/v1772022832/nest-items/spmpttso9ckjdi06ttos.jpg',
      productNames: ['Latarka czołowa 1000 lumenów', 'Lampka przednia USB', 'Lampka tylna LED', 'Zestaw oświetlenia rowerowego', 'Reflektor dynamo'],
      productDescriptions: [
        'Mocne światło do jazdy nocą w terenie.',
        'Kompaktowa lampka z ładowaniem USB.',
        'Migające i stałe światło, widoczność z tyłu.',
        'Przednia i tylna lampa w jednym zestawie.',
        'Oświetlenie bez baterii, napędzane kołem.',
      ],
    },
    {
      name: 'Części',
      description: 'Wszystko, czego potrzebuje Twój rower.',
      imageUrl: 'https://res.cloudinary.com/dpycpc1op/image/upload/h_300,c_scale/v1772022574/nest-items/r7bj4b2otqlomolka5s1.jpg',
      productNames: ['Opona MTB 29"', 'Kaseta 12-biegowa', 'Łańcuch 11-speed', 'Szprychy do koła', 'Hamulce tarczowe'],
      productDescriptions: [
        'Opona do terenu, doskonała przyczepność.',
        'Kaseta tylna do napędu 12-biegowego.',
        'Wytrzymały łańcuch do systemu 11-rzędowego.',
        'Komplet szprych do budowy lub naprawy koła.',
        'Hydrauliczne hamulce tarczowe, pewne hamowanie.',
      ],
    },
  ];

  const categories: Category[] = [];
  for (const { name, description } of categoriesConfig) {
    const cat = categoryRepo.create({ name, description });
    await categoryRepo.save(cat);
    categories.push(cat);
  }

  // 4. Stwórz Produkty (nazwa, opis i zdjęcie dopasowane do kategorii)
  console.log('🚲 Tworzenie produktów...');
  const items: ShopItem[] = [];

  for (let i = 0; i < 50; i++) {
    const categoryIndex = faker.helpers.arrayElement(categoriesConfig.map((_, idx) => idx));
    const category = categories[categoryIndex];
    const config = categoriesConfig[categoryIndex];

    const item = shopItemRepo.create({
      name: faker.helpers.arrayElement(config.productNames),
      description: faker.helpers.arrayElement(config.productDescriptions),
      price: parseInt(faker.commerce.price({ min: 100, max: 10000 }), 10),
      isAvailable: faker.datatype.boolean(),
      category,
      imageUrl: config.imageUrl,
      details: {
        color: faker.color.human(),
        manufacturer: faker.vehicle.manufacturer(),
        material: faker.helpers.arrayElement(['Aluminium', 'Carbon', 'Steel']),
        weight: faker.number.float({ min: 8, max: 15, fractionDigits: 1 }),
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
