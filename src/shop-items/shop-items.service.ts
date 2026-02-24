import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateShopItemInput } from './dto/create-shop-item.input';
import { UpdateShopItemInput } from './dto/update-shop-item.input';
import { ShopItem } from './entities/shop-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetShopItemsFilterInput } from './dto/get-shop-items-filter.input';

@Injectable()
export class ShopItemsService {
  constructor(
    @InjectRepository(ShopItem)
    private ShopItemsRepository: Repository<ShopItem>,
  ) {}

  async create(createShopItemInput: CreateShopItemInput): Promise<ShopItem> {
    const { categoryId, ...rest } = createShopItemInput;

    const item = this.ShopItemsRepository.create({
      ...rest,
      stock: rest.stock ?? 0,
      details: rest.details ? rest.details : undefined,
      category: categoryId ? { id: categoryId } : undefined,
    });

    const savedItem = await this.ShopItemsRepository.save(item);

    return this.findOne(savedItem.id);
  }

  async findAll(filter: GetShopItemsFilterInput) {
    const limit = filter.limit ?? 10;
    const offset = filter.offset ?? 0;

    const query = this.ShopItemsRepository.createQueryBuilder('item');

    query.leftJoinAndSelect('item.category', 'category');
    query.leftJoinAndSelect('item.details', 'details');

    if (filter.search) {
      query.andWhere(
        '(item.name ILIKE :search OR item.description ILIKE :search)',
        {
          search: `%${filter.search}%`,
        },
      );
    }

    if (filter.minPrice != null) {
      query.andWhere('item.price >= :minPrice', { minPrice: filter.minPrice });
    }
    if (filter.maxPrice != null) {
      query.andWhere('item.price <= :maxPrice', { maxPrice: filter.maxPrice });
    }

    if (filter.categoryId != null) {
      query.andWhere('category.id = :categoryId', {
        categoryId: filter.categoryId,
      });
    }

    if (filter.minStock != null) {
      query.andWhere('item.stock >= :minStock', { minStock: filter.minStock });
    }
    if (filter.maxStock != null) {
      query.andWhere('item.stock <= :maxStock', { maxStock: filter.maxStock });
    }

    if (filter.isAvailable !== undefined && filter.isAvailable !== null) {
      query.andWhere('item.isAvailable = :isAvailable', {
        isAvailable: filter.isAvailable,
      });
    }

    if (filter.type != null) {
      query.andWhere('item.type = :type', { type: filter.type });
    }

    if (filter.manufacturer) {
      query.andWhere('details.manufacturer ILIKE :manufacturer', {
        manufacturer: `%${filter.manufacturer}%`,
      });
    }
    if (filter.material) {
      query.andWhere('details.material ILIKE :material', {
        material: `%${filter.material}%`,
      });
    }
    if (filter.color) {
      query.andWhere('details.color ILIKE :color', {
        color: `%${filter.color}%`,
      });
    }

    if (filter.minWeight != null) {
      query.andWhere('details.weight >= :minWeight', {
        minWeight: filter.minWeight,
      });
    }
    if (filter.maxWeight != null) {
      query.andWhere('details.weight <= :maxWeight', {
        maxWeight: filter.maxWeight,
      });
    }

    const sortBy = filter.sortBy ?? 'CREATED_AT';
    const sortOrder = filter.sortOrder ?? 'DESC';
    const orderDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    switch (sortBy) {
      case 'PRICE':
        query.orderBy('item.price', orderDirection);
        break;
      case 'NAME':
        query.orderBy('item.name', orderDirection);
        break;
      case 'STOCK':
        query.orderBy('item.stock', orderDirection);
        break;
      case 'WEIGHT':
        query.orderBy('details.weight', orderDirection, 'NULLS LAST');
        break;
      case 'CREATED_AT':
      default:
        query.orderBy('item.createdAt', orderDirection);
        break;
    }

    query.take(limit);
    query.skip(offset);

    return await query.getMany();
  }

  async findOne(id: number) {
    const item = await this.ShopItemsRepository.findOne({
      where: { id },
      relations: ['details', 'category'],
    });
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  async update(
    id: number,
    updateShopItemInput: UpdateShopItemInput,
  ): Promise<ShopItem> {
    const { categoryId, ...rest } = updateShopItemInput;

    const item = await this.ShopItemsRepository.preload({
      ...rest,
      category: categoryId ? { id: categoryId } : undefined,
    });

    if (!item) {
      throw new NotFoundException(`ShopItem #${id} not found`);
    }

    return await this.ShopItemsRepository.save(item);
  }

  async remove(id: number): Promise<ShopItem> {
    const item = await this.findOne(id);

    await this.ShopItemsRepository.remove(item);

    item.id = id;

    return item;
  }
}
