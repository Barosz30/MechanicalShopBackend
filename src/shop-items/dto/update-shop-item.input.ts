import { IsInt, IsPositive } from 'class-validator';
import { CreateShopItemInput } from './create-shop-item.input';
import { InputType, Field, PartialType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateShopItemInput extends PartialType(CreateShopItemInput) {
  @Field(() => Int)
  @IsInt({ message: 'ID musi być liczbą całkowitą' })
  @IsPositive({ message: 'ID musi być liczbą dodatnią' })
  id: number;
}
