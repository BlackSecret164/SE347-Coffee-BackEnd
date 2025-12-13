import { Injectable, Logger } from '@nestjs/common';
import { ProductCode, VnpLocale } from 'vnpay';
import { createVNPayInstance } from '../vnpay.config';
import { CreatePaymentUrlDto, PaymentResponseDto } from '../dtos/vnpay.dto';

@Injectable()
export class VnpayService {
  private readonly logger = new Logger(VnpayService.name);
  private readonly vnpay = createVNPayInstance();

  /**
   * Tạo URL thanh toán VNPay
   */
  async createPaymentUrl(
    createPaymentDto: CreatePaymentUrlDto,
    ipAddr: string,
  ): Promise<{ paymentUrl: string }> {
    try {
      const { orderId, amount, orderInfo, returnUrl, bankCode } =
        createPaymentDto;

      this.logger.log(
        `Creating payment URL for order ${orderId}, amount: ${amount}`,
      );

      const paymentUrl = this.vnpay.buildPaymentUrl({
        vnp_Amount: amount,
        vnp_IpAddr: ipAddr,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: returnUrl,
        vnp_Locale: VnpLocale.VN,
        ...(bankCode && { vnp_BankCode: bankCode }),
      });

      this.logger.log(`Payment URL created successfully for order ${orderId}`);

      return { paymentUrl };
    } catch (error) {
      this.logger.error('Error creating payment URL:', error);
      throw error;
    }
  }

  /**
   * Xác thực kết quả thanh toán từ VNPay callback
   */
  async verifyPayment(vnpayParams: any): Promise<PaymentResponseDto> {
    try {
      this.logger.log('Verifying payment callback from VNPay');

      // Xác thực signature và kết quả thanh toán
      const verify = this.vnpay.verifyReturnUrl(vnpayParams);

      if (!verify.isVerified) {
        this.logger.warn('Invalid signature from VNPay');
        return {
          isSuccess: false,
          message: 'Chữ ký không hợp lệ',
        };
      }

      if (!verify.isSuccess) {
        this.logger.warn(`Payment failed: ${verify.message}`);
        return {
          isSuccess: false,
          message: verify.message || 'Thanh toán thất bại',
        };
      }

      // Thanh toán thành công
      const orderId = verify.vnp_TxnRef;
      const amount = Number(verify.vnp_Amount) / 100; // VNPay trả về số tiền đã nhân 100

      this.logger.log(
        `Payment successful for order ${orderId}, amount: ${amount}`,
      );

      return {
        isSuccess: true,
        message: 'Thanh toán thành công',
        orderId: orderId,
        amount: amount,
        transactionNo: String(verify.vnp_TransactionNo),
        bankCode: verify.vnp_BankCode,
        cardType: verify.vnp_CardType,
        payDate: String(verify.vnp_PayDate),
      };
    } catch (error) {
      this.logger.error('Error verifying payment:', error);
      return {
        isSuccess: false,
        message: 'Lỗi xác thực thanh toán',
      };
    }
  }

  /**
   * Xử lý IPN (Instant Payment Notification) từ VNPay
   */
  async handleIpn(
    vnpayParams: any,
  ): Promise<{ RspCode: string; Message: string }> {
    try {
      this.logger.log('Processing IPN from VNPay');

      const verify = this.vnpay.verifyIpnCall(vnpayParams);

      if (!verify.isVerified) {
        this.logger.warn('Invalid IPN signature');
        return { RspCode: '97', Message: 'Invalid signature' };
      }

      if (!verify.isSuccess) {
        this.logger.warn('IPN payment failed');
        return { RspCode: '01', Message: 'Payment failed' };
      }

      const orderId = verify.vnp_TxnRef;
      this.logger.log(`IPN: Order ${orderId} paid successfully`);

      // TODO: Update order status in database
      // await this.orderService.updateOrderStatus(orderId, 'PAID');

      return { RspCode: '00', Message: 'Success' };
    } catch (error) {
      this.logger.error('Error processing IPN:', error);
      return { RspCode: '99', Message: 'Unknown error' };
    }
  }
}
