import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from '../entities/rating.entity';
import { RatingService } from '../services/rating.service';
import { RatingController } from '../controllers/rating.controller';
import { Customer } from '../entities/customer.entity';
import { Product } from '../entities/product.entity';
import { Order } from '../entities/order_tb.entity';
import { OrderDetails } from '../entities/order-details.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rating,
      Customer,
      Product,
      Order,
      OrderDetails,
    ]),
  ],
  providers: [RatingService],
  controllers: [RatingController],
})
export class RatingModule {}
