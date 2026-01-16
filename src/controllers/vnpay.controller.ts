import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { VnpayService } from '../services/vnpay.service';
import { CreatePaymentUrlDto, PaymentResponseDto } from '../dtos/vnpay.dto';

@ApiTags('VNPay Payment')
@Controller('payment/vnpay')
export class VnpayController {
  constructor(private readonly vnpayService: VnpayService) {}

  /**
   * Tạo URL thanh toán VNPay
   * POST /payment/vnpay/create
   */
  @Post('create')
  @ApiOperation({ summary: 'Tạo URL thanh toán VNPay' })
  @ApiResponse({
    status: 200,
    description: 'Tạo URL thanh toán thành công',
    schema: {
      example: {
        success: true,
        paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...',
        orderId: '123456',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 500, description: 'Lỗi server' })
  async createPaymentUrl(
    @Body() createPaymentDto: CreatePaymentUrlDto,
    @Req() req: Request,
  ) {
    try {
      // Lấy IP của khách hàng
      const ipAddr = (req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip ||
        '127.0.0.1') as string;

      const cleanIpAddr = ipAddr.replace('::ffff:', '');

      const result = await this.vnpayService.createPaymentUrl(
        createPaymentDto,
        cleanIpAddr,
      );

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error('[VNPay Controller] Error creating payment:', error);
      return {
        success: false,
        message: error.message || 'Không thể tạo thanh toán VNPay',
        error: error.message,
      };
    }
  }

  /**
   * Xác thực kết quả thanh toán từ VNPay
   * GET /payment/vnpay/callback
   */
  @Get('callback')
  @ApiOperation({ summary: 'Callback từ VNPay sau khi thanh toán' })
  @ApiResponse({
    status: 200,
    description: 'Xác thực thanh toán',
    type: PaymentResponseDto,
  })
  async verifyPayment(@Query() query: any): Promise<PaymentResponseDto> {
    return await this.vnpayService.verifyPayment(query);
  }

  /**
   * Nhận IPN (Instant Payment Notification) từ VNPay
   * POST /payment/vnpay/ipn
   */
  @Post('ipn')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Nhận IPN từ VNPay' })
  @ApiResponse({
    status: 200,
    description: 'Phản hồi IPN',
    schema: {
      example: {
        RspCode: '00',
        Message: 'Success',
      },
    },
  })
  async handleIpn(@Body() body: any) {
    return await this.vnpayService.handleIpn(body);
  }
}
