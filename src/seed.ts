import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { ShopItem } from './shop-items/entities/shop-item.entity';
import { Category } from './categories/entities/category.entity';
import { ShopItemDetails } from './shop-items/entities/shop-item-details.entity';
import { User } from './users/entities/user.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';

config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [ShopItem, Category, ShopItemDetails, User, Order, OrderItem],
  synchronize: false,
  ssl: true,
});

const keyboardCategories = [
  {
    name: 'Keyboards',
    description:
      'Custom mechanical keyboards for premium typing feel, low-latency gaming, and desk setup aesthetics.',
  },
  {
    name: 'Switches',
    description:
      'Linear, tactile, and silent switch packs for tuning sound, actuation force, and key feel.',
  },
  {
    name: 'Keycaps',
    description:
      'PBT and ABS keycap sets with durable legends, themed colorways, and multiple profile options.',
  },
  {
    name: 'Deskmats',
    description:
      'Large-format deskmats with stitched edges and smooth glide to unify keyboard and mouse zones.',
  },
  {
    name: 'Accessories',
    description:
      'Cables, lube kits, tools, and small parts that complete and maintain a custom keyboard build.',
  },
] as const;

const keyboardProducts = [
  {
    name: 'Aurora TKL Pro',
    category: 'Keyboards',
    price: 189,
    stock: 34,
    isAvailable: true,
    imageUrl:
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80',
    description:
      'A gasket-mounted tenkeyless board with tri-mode connectivity and a deep, tuned acoustic profile.',
    details: {
      manufacturer: 'MechaShop Labs',
      material: 'Aluminum + Polycarbonate',
      weight: 1.05,
      color: 'Midnight Cyan',
    },
  },
  {
    name: 'Forge65 Alloy',
    category: 'Keyboards',
    price: 229,
    stock: 18,
    isAvailable: true,
    imageUrl:
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80',
    description:
      'Compact CNC 65% layout with flex-cut plate, premium heft, and fast wireless switching.',
    details: {
      manufacturer: 'MechaShop Labs',
      material: 'CNC Aluminum',
      weight: 1.3,
      color: 'Graphite',
    },
  },
  {
    name: 'Pulse75 Wireless',
    category: 'Keyboards',
    price: 205,
    stock: 22,
    isAvailable: true,
    imageUrl:
      'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=900&q=80',
    description:
      '75% wireless board with OLED controls and foam tuning for smoother, quieter keystrokes.',
    details: {
      manufacturer: 'MechaShop Labs',
      material: 'Aluminum + FR4',
      weight: 1.12,
      color: 'Shadow Violet',
    },
  },
  {
    name: 'Nebula Linear 70-Pack',
    category: 'Switches',
    price: 42,
    stock: 120,
    isAvailable: true,
    imageUrl:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
    description:
      'Factory-lubed linear switches with smooth travel and bright, clean bottom-out sound.',
    details: {
      manufacturer: 'Keysteel',
      material: 'POM + Nylon',
      weight: 0.06,
      color: 'Frost Lilac',
    },
  },
  {
    name: 'Atlas Tactile 70-Pack',
    category: 'Switches',
    price: 45,
    stock: 92,
    isAvailable: true,
    imageUrl:
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=80',
    description:
      'Long-pole tactile switches with pronounced bump for controlled typing feedback.',
    details: {
      manufacturer: 'Keysteel',
      material: 'POM + Polycarbonate',
      weight: 0.07,
      color: 'Emerald Mint',
    },
  },
  {
    name: 'Signal PBT Keycap Set',
    category: 'Keycaps',
    price: 89,
    stock: 40,
    isAvailable: true,
    imageUrl:
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=80',
    description:
      'Dye-sub PBT set with high-contrast legends and accent keys for custom desk themes.',
    details: {
      manufacturer: 'LegendWorks',
      material: 'Dye-sub PBT',
      weight: 0.85,
      color: 'Signal Orange',
    },
  },
  {
    name: 'Mono Night Keycap Set',
    category: 'Keycaps',
    price: 94,
    stock: 25,
    isAvailable: true,
    imageUrl:
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=900&q=80',
    description:
      'Monochrome textured keycaps with icon modifiers for minimalist productivity builds.',
    details: {
      manufacturer: 'LegendWorks',
      material: 'Textured PBT',
      weight: 0.88,
      color: 'Matte Obsidian',
    },
  },
  {
    name: 'Vector Deskmat',
    category: 'Deskmats',
    price: 34,
    stock: 64,
    isAvailable: true,
    imageUrl:
      'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=900&q=80',
    description:
      'Large stitched deskmat with smooth speed weave and stable base for keyboard and mouse.',
    details: {
      manufacturer: 'DeskGrid',
      material: 'Cloth + Rubber',
      weight: 0.52,
      color: 'Vector Cyan',
    },
  },
  {
    name: 'Horizon Deskmat',
    category: 'Deskmats',
    price: 36,
    stock: 53,
    isAvailable: true,
    imageUrl:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
    description:
      'Wide-format deskmat tuned for low-friction movement and all-day setup comfort.',
    details: {
      manufacturer: 'DeskGrid',
      material: 'Micro-weave Cloth + Rubber',
      weight: 0.55,
      color: 'Horizon Teal',
    },
  },
  {
    name: 'Orbit Coiled Cable',
    category: 'Accessories',
    price: 54,
    stock: 47,
    isAvailable: true,
    imageUrl:
      'https://images.unsplash.com/photo-1587202372775-e229f172f2e8?auto=format&fit=crop&w=900&q=80',
    description:
      'Detachable coiled USB-C cable with aviator connector and low-memory sleeving.',
    details: {
      manufacturer: 'CableForge',
      material: 'Paracord + PET',
      weight: 0.18,
      color: 'Cyan Violet',
    },
  },
  {
    name: 'Cloud Wrist Rest',
    category: 'Accessories',
    price: 39,
    stock: 30,
    isAvailable: true,
    imageUrl:
      'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    description:
      'Memory-foam wrist rest with anti-slip base designed for long typing sessions.',
    details: {
      manufacturer: 'ComfortKey',
      material: 'Memory Foam + PU',
      weight: 0.34,
      color: 'Slate',
    },
  },
  {
    name: 'Tune Kit Essentials',
    category: 'Accessories',
    price: 24,
    stock: 72,
    isAvailable: true,
    imageUrl:
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',
    description:
      'Starter kit with puller, brush, switch opener, and lube station for first-time modding.',
    details: {
      manufacturer: 'ModLab',
      material: 'ABS + Steel',
      weight: 0.21,
      color: 'Violet',
    },
  },
] as const;

async function runSeed() {
  console.log('🌱 Starting keyboard storefront seed...');

  await dataSource.initialize();
  const shopItemRepo = dataSource.getRepository(ShopItem);
  const categoryRepo = dataSource.getRepository(Category);
  const userRepo = dataSource.getRepository(User);
  const orderRepo = dataSource.getRepository(Order);
  const orderItemRepo = dataSource.getRepository(OrderItem);

  console.log('🧹 Cleaning existing catalog...');
  await orderItemRepo.createQueryBuilder().delete().execute();
  await orderRepo.createQueryBuilder().delete().execute();
  await shopItemRepo.createQueryBuilder().delete().execute();
  await categoryRepo.createQueryBuilder().delete().execute();

  console.log('📦 Creating categories...');
  const savedCategories = new Map<string, Category>();
  for (const categoryConfig of keyboardCategories) {
    const createdCategory = categoryRepo.create({
      name: categoryConfig.name,
      description: categoryConfig.description,
    });
    const savedCategory = await categoryRepo.save(createdCategory);
    savedCategories.set(savedCategory.name, savedCategory);
  }

  console.log('⌨️ Creating shop items...');
  const createdItems = keyboardProducts.map((productConfig) => {
    const category = savedCategories.get(productConfig.category);
    if (!category) {
      throw new Error(`Missing category ${productConfig.category} while seeding products.`);
    }

    return shopItemRepo.create({
      name: productConfig.name,
      description: productConfig.description,
      price: productConfig.price,
      stock: productConfig.stock,
      isAvailable: productConfig.isAvailable,
      imageUrl: productConfig.imageUrl,
      category,
      details: {
        manufacturer: productConfig.details.manufacturer,
        material: productConfig.details.material,
        weight: productConfig.details.weight,
        color: productConfig.details.color,
      },
    });
  });

  await shopItemRepo.save(createdItems);

  const demoUsername = 'demo';
  const existingDemo = await userRepo.findOneBy({ username: demoUsername });
  if (!existingDemo) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('Demo123!', salt);
    const demoUser = userRepo.create({ username: demoUsername, password: hashedPassword });
    await userRepo.save(demoUser);
    console.log('👤 Demo account created: demo / Demo123!');
  } else {
    console.log('👤 Demo account already exists.');
  }

  console.log(
    `✅ Seed completed. Categories: ${keyboardCategories.length}, products: ${createdItems.length}`,
  );
  await dataSource.destroy();
}

runSeed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
