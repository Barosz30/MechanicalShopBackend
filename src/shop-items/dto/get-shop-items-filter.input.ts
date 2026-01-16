import { Field, InputType, Int, Float } from '@nestjs/graphql';
import { IsOptional, Min, IsString, IsInt, IsNumber } from 'class-validator';

@InputType()
export class GetShopItemsFilterInput {
  @Field(() => Int, {
    defaultValue: 10,
    description: 'Ile elementów pobrać (limit)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit: number;

  @Field(() => Int, {
    defaultValue: 0,
    description: 'Ile elementów pominąć (offset)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset: number;

  @Field(() => String, { nullable: true, description: 'Wyszukaj po nazwie' })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Float, { nullable: true, description: 'Cena minimalna' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @Field(() => Float, { nullable: true, description: 'Cena maksymalna' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @Field(() => Int, { nullable: true, description: 'ID Kategorii' })
  @IsOptional()
  @IsInt()
  categoryId?: number;
}
