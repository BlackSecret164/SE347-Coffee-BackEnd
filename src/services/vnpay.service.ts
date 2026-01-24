import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCode, VnpLocale } from 'vnpay';
import { CreatePaymentUrlDto, PaymentResponseDto } from '../dtos/vnpay.dto';
import { Order } from '../entities/order_tb.entity';
import { VNPayTransaction } from '../entities/vnpay-transaction.entity';
import { Customer } from '../entities/customer.entity';
import { createVNPayInstance } from '../vnpay.config';

@Injectable()
export class VnpayService {
  private readonly logger = new Logger(VnpayService.name);
  private readonly vnpay = createVNPayInstance();

  constructor(
    @InjectRepository(VNPayTransaction)
    private readonly vnpayTransactionRepo: Repository<VNPayTransaction>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  /**
   * Tạo URL thanh toán VNPay
   */
  async createPaymentUrl(
    createPaymentDto: CreatePaymentUrlDto,
    ipAddr: string,
  ): Promise<{ paymentUrl: string; orderId: string }> {
    try {
      const { orderId, amount, orderInfo, returnUrl, bankCode } =
        createPaymentDto;

      // Validate amount (tối thiểu 5000đ)
      if (amount < 5000) {
        throw new BadRequestException('Số tiền tối thiểu là 5,000đ');
      }

      // VNPay yêu cầu số tiền phải nhân 100 (VD: 50,000đ -> 5,000,000)
      const vnpAmount = Math.floor(amount);

      this.logger.log(
        `[VNPay] Creating payment URL for order ${orderId}, amount: ${amount}đ (VNPay: ${vnpAmount}), IP: ${ipAddr}`,
      );

      const paymentUrl = this.vnpay.buildPaymentUrl({
        vnp_Amount: vnpAmount,
        vnp_IpAddr: ipAddr,
        vnp_TxnRef: String(orderId),
        vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: returnUrl,
        vnp_Locale: VnpLocale.VN,
        ...(bankCode && { vnp_BankCode: bankCode }),
      });

      this.logger.debug(`[VNPay] Payment URL: ${paymentUrl}`);

      return { paymentUrl, orderId: String(orderId) };
    } catch (error) {
      this.logger.error(`[VNPay] Error creating payment URL:`, error.message);
      throw error;
    }
  }

  /**
   * Xác thực kết quả thanh toán từ VNPay callback
   */
  async verifyPayment(vnpayParams: any): Promise<PaymentResponseDto> {
    try {
      this.logger.log('[VNPay] Verifying payment callback from VNPay');
      this.logger.debug(
        '[VNPay] Callback params:',
        JSON.stringify(vnpayParams),
      );

      // Xác thực signature và kết quả thanh toán
      const verify = this.vnpay.verifyReturnUrl(vnpayParams);

      if (!verify.isVerified) {
        this.logger.error('[VNPay] Invalid signature from VNPay');
        return {
          isSuccess: false,
          message: 'Chữ ký không hợp lệ',
        };
      }

      const responseCode = vnpayParams.vnp_ResponseCode;
      const orderId = verify.vnp_TxnRef;
      const amount = Number(verify.vnp_Amount);
      const transactionNo = verify.vnp_TransactionNo;
      const bankCode = verify.vnp_BankCode;
      const payDate = verify.vnp_PayDate;

      if (responseCode === '00') {
        // Thanh toán thành công
        this.logger.log(
          `[VNPay] Payment success for order ${orderId}, amount: ${amount}đ, transactionNo: ${transactionNo}`,
        );

        // Lưu VNPay transaction vào database
        await this.saveVNPayTransaction({
          orderId: Number(orderId),
          vnpTxnRef: String(orderId),
          vnpAmount: Number(verify.vnp_Amount),
          vnpTransactionNo: String(transactionNo),
          vnpBankCode: String(bankCode),
          vnpCardType: verify.vnp_CardType,
          vnpOrderInfo: vnpayParams.vnp_OrderInfo,
          vnpPayDate: String(payDate),
          vnpResponseCode: responseCode,
          vnpTmnCode: vnpayParams.vnp_TmnCode,
          vnpTransactionStatus: vnpayParams.vnp_TransactionStatus,
          vnpSecureHash: vnpayParams.vnp_SecureHash,
          isSuccess: true,
          rawData: vnpayParams,
        });

        // Update order payment status
        await this.updateOrderPaymentStatus(Number(orderId), {
          paymentStatus: 'Đã thanh toán',
          paymentMethod: 'VNPay',
          status: 'Chờ xác nhận',
        });

        // Cập nhật customer total sau khi thanh toán thành công
        await this.updateCustomerTotalAfterPayment(Number(orderId), amount);

        return {
          isSuccess: true,
          message: 'Thanh toán thành công',
          orderId: String(orderId),
          amount: amount,
          transactionNo: String(transactionNo),
          bankCode: String(bankCode),
          cardType: verify.vnp_CardType,
          payDate: String(payDate),
        };
      } else {
        // Thanh toán thất bại
        const errorMessage = this.getVNPayErrorMessage(responseCode);
        this.logger.warn(
          `[VNPay] Payment failed for order ${orderId}, code: ${responseCode}, message: ${errorMessage}`,
        );

        // Lưu failed transaction vào database
        await this.saveVNPayTransaction({
          orderId: Number(orderId),
          vnpTxnRef: String(orderId),
          vnpAmount: Number(verify.vnp_Amount),
          vnpTransactionNo: vnpayParams.vnp_TransactionNo || null,
          vnpBankCode: vnpayParams.vnp_BankCode || null,
          vnpCardType: vnpayParams.vnp_CardType || null,
          vnpOrderInfo: vnpayParams.vnp_OrderInfo,
          vnpPayDate: vnpayParams.vnp_PayDate || null,
          vnpResponseCode: responseCode,
          vnpTmnCode: vnpayParams.vnp_TmnCode,
          vnpTransactionStatus: vnpayParams.vnp_TransactionStatus || null,
          vnpSecureHash: vnpayParams.vnp_SecureHash,
          isSuccess: false,
          errorMessage: errorMessage,
          rawData: vnpayParams,
        });

        // Update order payment status to failed
        await this.updateOrderPaymentStatus(Number(orderId), {
          paymentStatus: 'Thanh toán thất bại',
          paymentMethod: 'VNPay',
        });

        return {
          isSuccess: false,
          message: errorMessage,
          orderId: String(orderId),
        };
      }
    } catch (error) {
      this.logger.error('[VNPay] Error verifying payment:', error.message);
      return {
        isSuccess: false,
        message: 'Có lỗi xảy ra khi xử lý callback',
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
      this.logger.log('[VNPay] Processing IPN from VNPay');
      this.logger.debug('[VNPay] IPN params:', JSON.stringify(vnpayParams));

      const verify = this.vnpay.verifyIpnCall(vnpayParams);

      if (!verify.isVerified) {
        this.logger.error('[VNPay] Invalid IPN signature');
        return { RspCode: '97', Message: 'Invalid signature' };
      }

      if (!verify.isSuccess) {
        this.logger.warn('[VNPay] IPN payment failed');
        return { RspCode: '01', Message: 'Payment failed' };
      }

      const orderId = verify.vnp_TxnRef;
      const amount = Number(verify.vnp_Amount) / 100;
      const transactionNo = verify.vnp_TransactionNo;

      this.logger.log(
        `[VNPay] IPN: Order ${orderId} paid successfully, amount: ${amount}đ, transactionNo: ${transactionNo}`,
      );

      // Update IPN received timestamp
      const existingTransaction = await this.vnpayTransactionRepo.findOne({
        where: { vnpTxnRef: String(orderId) },
      });

      if (existingTransaction) {
        existingTransaction.ipnReceivedAt = new Date();
        await this.vnpayTransactionRepo.save(existingTransaction);
        this.logger.log(`[VNPay] Updated IPN timestamp for order ${orderId}`);
      }

      return { RspCode: '00', Message: 'Success' };
    } catch (error) {
      this.logger.error('[VNPay] Error processing IPN:', error.message);
      return { RspCode: '99', Message: 'Unknown error' };
    }
  }

  /**
   * Lưu VNPay transaction vào database
   */
  private async saveVNPayTransaction(data: any): Promise<VNPayTransaction> {
    try {
      // Check if transaction already exists (prevent duplicate)
      const existing = await this.vnpayTransactionRepo.findOne({
        where: { vnpTxnRef: data.vnpTxnRef },
      });

      if (existing) {
        this.logger.log(
          `[VNPay] Transaction already exists for ${data.vnpTxnRef}, updating...`,
        );
        // Update existing transaction
        Object.assign(existing, {
          ...data,
          callbackReceivedAt: new Date(),
          updatedAt: new Date(),
        });
        return await this.vnpayTransactionRepo.save(existing);
      }

      // Create new transaction
      const transaction = this.vnpayTransactionRepo.create({
        ...data,
        callbackReceivedAt: new Date(),
      });

      // Save single entity (not array)
      const saved = await this.vnpayTransactionRepo.save(transaction);
      const result = Array.isArray(saved) ? saved[0] : saved;

      this.logger.log(
        `[VNPay] Transaction saved with ID: ${result.id} for order ${data.orderId}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`[VNPay] Error saving transaction:`, error.message);
      throw error;
    }
  }

  /**
   * Update order payment status
   */
  private async updateOrderPaymentStatus(
    orderId: number,
    updates: Partial<Order>,
  ): Promise<void> {
    try {
      const order = await this.orderRepo.findOne({ where: { id: orderId } });

      if (!order) {
        this.logger.warn(`[VNPay] Order ${orderId} not found`);
        return;
      }

      Object.assign(order, updates);
      await this.orderRepo.save(order);

      this.logger.log(
        `[VNPay] Updated order ${orderId} payment status to: ${updates.paymentStatus}`,
      );
    } catch (error) {
      this.logger.error(
        `[VNPay] Error updating order ${orderId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Cập nhật customer total sau khi thanh toán thành công qua VNPay
   */
  private async updateCustomerTotalAfterPayment(
    orderId: number,
    amount: number,
  ): Promise<void> {
    try {
      const order = await this.orderRepo.findOne({ 
        where: { id: orderId },
        relations: ['customer']
      });

      if (!order || !order.phoneCustomer) {
        this.logger.warn(`[VNPay] Order ${orderId} has no customer info`);
        return;
      }

      const customer = await this.customerRepo.findOne({ 
        where: { phone: order.phoneCustomer } 
      });

      if (customer) {
        customer.total = (customer.total || 0) + amount;
        await this.customerRepo.save(customer);
        this.logger.log(
          `[VNPay] Updated customer ${order.phoneCustomer} total: +${amount}đ (new total: ${customer.total}đ)`,
        );
      }
    } catch (error) {
      this.logger.error(
        `[VNPay] Error updating customer total for order ${orderId}:`,
        error.message,
      );
      // Không throw error để không ảnh hưởng flow thanh toán
    }
  }

  /**
   * Helper function để convert VNPay response code sang message
   */
  private getVNPayErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
    };

    return messages[code] || 'Giao dịch thất bại';
  }
}
