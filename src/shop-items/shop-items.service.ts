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
      details: rest.details ? rest.details : undefined,
      category: categoryId ? { id: categoryId } : undefined,
    });

    const savedItem = await this.ShopItemsRepository.save(item);

    return this.findOne(savedItem.id);
  }

  async findAll(filter: GetShopItemsFilterInput) {
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

    if (filter.minPrice) {
      query.andWhere('item.price >= :minPrice', { minPrice: filter.minPrice });
    }
    if (filter.maxPrice) {
      query.andWhere('item.price <= :maxPrice', { maxPrice: filter.maxPrice });
    }

    if (filter.categoryId) {
      query.andWhere('category.id = :categoryId', {
        categoryId: filter.categoryId,
      });
    }

    query.take(filter.limit);
    query.skip(filter.offset);

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
