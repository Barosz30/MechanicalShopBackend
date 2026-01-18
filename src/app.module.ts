import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ShopItemsModule } from './shop-items/shop-items.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopItem } from './shop-items/entities/shop-item.entity';
import { ConfigModule } from '@nestjs/config';
import { ShopItemDetails } from './shop-items/entities/shop-item-details.entity';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './categories/entities/category.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [ShopItem, ShopItemDetails, Category, User],
      synchronize: false,
      ssl: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: false,
      introspection: true,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    ShopItemsModule,
    CategoriesModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
