import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class ShopItemDetails {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { description: 'Producent (np. Shimano)' })
  @Column()
  manufacturer: string;

  @Field(() => String, { description: 'Materiał (np. Carbon)' })
  @Column()
  material: string;

  @Field(() => Float, { description: 'Waga w kg' })
  @Column('float')
  weight: number;

  @Field(() => String, { description: 'Kolor' })
  @Column()
  color: string;
}
