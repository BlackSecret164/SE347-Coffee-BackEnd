import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VnpayController } from '../controllers/vnpay.controller';
import { VnpayService } from '../services/vnpay.service';
import { VNPayTransaction } from '../entities/vnpay-transaction.entity';
import { Order } from '../entities/order_tb.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VNPayTransaction, Order])],
  controllers: [VnpayController],
  providers: [VnpayService],
  exports: [VnpayService],
})
export class VnpayModule {}
