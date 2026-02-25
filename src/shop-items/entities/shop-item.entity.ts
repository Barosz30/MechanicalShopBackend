import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ShopItemDetails } from './shop-item-details.entity';
import { Category } from '@src/categories/entities/category.entity';

@ObjectType()
@Entity()
export class ShopItem {
  @Field(() => Int, { description: 'ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { description: 'Name' })
  @Column()
  name: string;

  @Field(() => Int, { description: 'Price' })
  @Column()
  price: number;

  @Field(() => String, { description: 'Description', nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => Boolean, { defaultValue: true })
  @Column({ default: true })
  isAvailable: boolean;

  @Field(() => Int, { description: 'Ilość w magazynie (stan)', defaultValue: 0 })
  @Column({ default: 0 })
  stock: number;

  @Field(() => Date, { description: 'Data dodania' })
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => ShopItemDetails, { nullable: true })
  @OneToOne(() => ShopItemDetails, { cascade: true })
  @JoinColumn()
  details: ShopItemDetails;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.shopItems, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  imageUrl?: string;
}
