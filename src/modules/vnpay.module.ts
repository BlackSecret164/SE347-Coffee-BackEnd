import { Module } from '@nestjs/common';
import { VnpayController } from '../controllers/vnpay.controller';
import { VnpayService } from '../services/vnpay.service';

@Module({
  controllers: [VnpayController],
  providers: [VnpayService],
  exports: [VnpayService],
})
export class VnpayModule {}
