import { InputType, Int, Field, Float } from '@nestjs/graphql';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
@InputType()
export class CreateShopItemDetailsInput {
  @Field(() => String)
  @IsString()
  @MinLength(2)
  manufacturer: string;

  @Field(() => String)
  @IsString()
  material: string;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  weight: number;

  @Field(() => String)
  @IsString()
  color: string;
}

@InputType()
export class CreateShopItemInput {
  @Field(() => String, { description: 'Name' })
  @IsString({ message: 'Nazwa musi być ciągiem znaków' })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name: string;

  @Field(() => Int, { description: 'Price' })
  @IsInt({ message: 'Cena musi być liczbą całkowitą' })
  @Min(0, { message: 'Cena nie może być ujemna' })
  price: number;

  @Field(() => String, { description: 'Description', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Opis jest zbyt długi (max 1000 znaków)' })
  description?: string;

  @Field(() => Boolean, {
    description: 'Czy produkt jest dostępny?',
    nullable: true,
    defaultValue: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @Field(() => CreateShopItemDetailsInput, { nullable: true })
  @ValidateNested()
  @Type(() => CreateShopItemDetailsInput)
  details?: CreateShopItemDetailsInput;

  @Field(() => Int, {
    nullable: true,
    description: 'ID Kategorii do której należy przedmiot',
  })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @Field(() => String, { description: 'URL obrazu', nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field(() => Int, {
    description: 'Ilość w magazynie (stan)',
    nullable: true,
    defaultValue: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}
