import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ShopItem } from 'src/shop-items/entities/shop-item.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@ObjectType()
@Entity()
export class Category {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => ShopItem, (shopItem) => shopItem.category)
  @Field(() => [ShopItem], { nullable: true })
  shopItems: ShopItem[];
}
