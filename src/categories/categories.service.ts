import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryInput } from './dto/create-category.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { UpdateCategoryInput } from './dto/update-category.input';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  create(createCategoryInput: CreateCategoryInput) {
    const newCategory = this.categoryRepository.create(createCategoryInput);
    return this.categoryRepository.save(newCategory);
  }

  findAll() {
    return this.categoryRepository.find({
      relations: ['shopItems'],
    });
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['shopItems'],
    });
    if (!category) throw new NotFoundException(`Category #${id} not found`);
    return category;
  }

  // Update i Remove zostawiam Tobie jako ćwiczenie (są analogiczne do ShopItems)

  async remove(id: number): Promise<Category> {
    const category = await this.findOne(id);

    await this.categoryRepository.remove(category);

    category.id = id;

    return category;
  }

  async update(
    id: number,
    updateCategoryInput: UpdateCategoryInput,
  ): Promise<Category> {
    const category = await this.categoryRepository.preload({
      ...updateCategoryInput,
    });

    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }

    return await this.categoryRepository.save(category);
  }
}
