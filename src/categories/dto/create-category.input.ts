import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateCategoryInput {
  @Field(() => String, { description: 'Nazwa kategorii' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @Field(() => String, { description: 'Opis kategorii', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
