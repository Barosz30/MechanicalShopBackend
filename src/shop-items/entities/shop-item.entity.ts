import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ItemTypes } from '../../common/enums/item-types.enum';
import {
  Column,
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

  @Field(() => ItemTypes, { description: 'Type' })
  @Column({
    type: 'enum',
    enum: ItemTypes,
  })
  type: ItemTypes;

  @Field(() => Int, { description: 'Price' })
  @Column()
  price: number;

  @Field(() => String, { description: 'Description', nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => Boolean, { defaultValue: true })
  @Column({ default: true })
  isAvailable: boolean;

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
