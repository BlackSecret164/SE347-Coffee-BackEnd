import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from '../controllers/report.controller';
import { ReportService } from '../services/report.service';
import { Order } from '../entities/order_tb.entity';
import { Product } from '../entities/product.entity';
import { Customer } from '../entities/customer.entity';
import { Staff } from '../entities/staff.entity';
import { Table } from '../entities/tables.entity';
import { OrderDetails } from '../entities/order-details.entity';
import { Branch } from 'src/entities/branches.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, Customer, Staff, Table, OrderDetails, Branch])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
