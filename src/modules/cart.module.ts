import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from '../entities/cart_item.entity';
import { CartService } from '../services/cart.service';
import { CartController } from '../controllers/cart.controller';
import { Customer } from '../entities/customer.entity';
import { Product } from '../entities/product.entity';
import { ProductSize } from '../entities/product_size.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartItem,
      Customer,
      Product,
      ProductSize,
    ]),
  ],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
