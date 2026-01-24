// src/modules/order.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/order_tb.entity';
import { OrderDetails } from '../entities/order-details.entity';
import { Customer } from '../entities/customer.entity';
import { OrderService } from '../services/order.service';
import { OrderController } from '../controllers/order.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderDetails, Customer])],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
