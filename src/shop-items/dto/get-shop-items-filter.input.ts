import { Field, InputType, Int, Float } from '@nestjs/graphql';
import {
  IsOptional,
  Min,
  IsString,
  IsInt,
  IsNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemTypes } from 'src/common/enums/item-types.enum';
import { SortOrder } from 'src/common/enums/sort-order.enum';
import { ShopItemSortBy } from 'src/common/enums/shop-item-sort-by.enum';

@InputType()
export class GetShopItemsFilterInput {
  @Field(() => Int, {
    defaultValue: 10,
    description: 'Ile elementów pobrać (limit)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @Field(() => Int, {
    defaultValue: 0,
    description: 'Ile elementów pominąć (offset)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @Field(() => String, { nullable: true, description: 'Wyszukaj po nazwie lub opisie' })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Float, { nullable: true, description: 'Cena minimalna' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @Field(() => Float, { nullable: true, description: 'Cena maksymalna' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @Field(() => Int, { nullable: true, description: 'ID Kategorii' })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @Field(() => Int, { nullable: true, description: 'Minimalna ilość w magazynie (stan)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minStock?: number;

  @Field(() => Int, { nullable: true, description: 'Maksymalna ilość w magazynie (stan)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxStock?: number;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Tylko produkty dostępne (isAvailable = true)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAvailable?: boolean;

  @Field(() => ItemTypes, { nullable: true, description: 'Typ produktu (BIKE / PART)' })
  @IsOptional()
  @IsEnum(ItemTypes)
  type?: ItemTypes;

  @Field(() => String, {
    nullable: true,
    description: 'Filtr po producencie (ze szczegółów)',
  })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Filtr po materiale (ze szczegółów)',
  })
  @IsOptional()
  @IsString()
  material?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Filtr po kolorze (ze szczegółów)',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @Field(() => Float, {
    nullable: true,
    description: 'Minimalna waga w kg (ze szczegółów)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minWeight?: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Maksymalna waga w kg (ze szczegółów)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxWeight?: number;

  @Field(() => ShopItemSortBy, {
    nullable: true,
    description: 'Po czym sortować (domyślnie: CREATED_AT)',
    defaultValue: ShopItemSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ShopItemSortBy)
  sortBy?: ShopItemSortBy = ShopItemSortBy.CREATED_AT;

  @Field(() => SortOrder, {
    nullable: true,
    description: 'Kierunek sortowania (ASC / DESC)',
    defaultValue: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
